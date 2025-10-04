const express = require("express");
const router = express.Router();
const Purchase = require("../models/Purchase");
const { sendLowStockAlert } = require("../utils/email");

// Helper function to calculate all derived fields
// THIS FUNCTION IS NOW FIXED TO PREVENT NaN
function transformPurchaseDoc(doc) {
  const purchase = doc.toObject ? doc.toObject() : JSON.parse(JSON.stringify(doc));
  
  purchase.purchaseOrders = (purchase.purchaseOrders || []).map(order => {
    // --- FIX IS HERE ---
    // Recalculate if values are missing, to fix old data
    const totalValue = order.totalValue || (order.orderedQty * order.pricePerUnit);
    const gstAmount = order.gstAmount || (totalValue * (order.gstRate || 0) / 100);
    const totalValueWithGst = totalValue + gstAmount;
    // --- END OF FIX ---

    const totalPaid = (order.advancePaid || 0) + (order.payments || []).reduce((sum, p) => sum + p.amount, 0);
    const totalReceived = (order.deliveriesReceived || []).reduce((sum, d) => sum + d.qty, 0);
    const balanceAmount = totalValueWithGst - totalPaid;
    const pendingDelivery = (order.orderedQty || 0) - totalReceived;

    return { ...order, totalPaid, totalReceived, balanceAmount, pendingDelivery };
  });

  const totalStockIn = purchase.purchaseOrders.reduce((sum, o) => sum + o.totalReceived, 0);
  const totalStockOut = (purchase.usageLogs || []).reduce((sum, log) => sum + log.usedQty, 0);
  purchase.availableStock = totalStockIn - totalStockOut;

  purchase.summary = {
    totalOrdered: purchase.purchaseOrders.reduce((sum, o) => sum + o.orderedQty, 0),
    totalReceived: totalStockIn,
    totalUsed: totalStockOut,
    totalAmount: purchase.purchaseOrders.reduce((sum, o) => (o.totalValue || (o.orderedQty * o.pricePerUnit)) + (o.gstAmount || ((o.orderedQty * o.pricePerUnit) * (o.gstRate || 0) / 100)), 0),
    totalPaid: purchase.purchaseOrders.reduce((sum, o) => sum + o.totalPaid, 0),
  };
  purchase.summary.totalBalance = purchase.summary.totalAmount - purchase.summary.totalPaid;

  return purchase;
}

// GET all purchases
router.get("/", async (req, res) => {
  try {
    const purchases = await Purchase.find().sort({ updatedAt: -1 });
    res.json(purchases.map(transformPurchaseDoc));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// GET a single purchase by ID
router.get("/:id", async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) return res.status(404).json({ error: "Purchase record not found" });
    res.json(transformPurchaseDoc(purchase));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// POST a new purchase record
router.post("/", async (req, res) => {
  try {
    const { materialName, supplierName, unit } = req.body;
    const newPurchase = new Purchase({ materialName, supplierName, unit });
    await newPurchase.save();
    res.status(201).json(newPurchase);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// DELETE a purchase record
router.delete("/:id", async (req, res) => {
  try {
    await Purchase.findByIdAndDelete(req.params.id);
    res.json({ message: "Purchase record deleted successfully" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- THIS ROUTE IS NOW FIXED ---
// POST a new purchase order
router.post("/:id/orders", async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) return res.status(404).json({ error: "Purchase record not found" });

    const newOrder = { ...req.body };

    // Calculate total and GST before saving
    newOrder.totalValue = (newOrder.orderedQty || 0) * (newOrder.pricePerUnit || 0);
    newOrder.gstAmount = newOrder.totalValue * ((newOrder.gstRate || 0) / 100);

    purchase.purchaseOrders.push(newOrder);
    await purchase.save();
    res.json(transformPurchaseDoc(purchase));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// POST a payment to a specific purchase order
router.post("/:id/orders/:orderId/payments", async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) return res.status(400).json({ error: "Valid amount required" });

        const purchase = await Purchase.findById(req.params.id);
        const order = purchase.purchaseOrders.id(req.params.orderId);
        if(!order) return res.status(404).json({error: "Order not found"});

        const totalValue = order.totalValue || (order.orderedQty * order.pricePerUnit);
        const gstAmount = order.gstAmount || (totalValue * (order.gstRate || 0) / 100);
        const totalValueWithGst = totalValue + gstAmount;

        const totalPaid = (order.advancePaid || 0) + (order.payments || []).reduce((sum, p) => sum + p.amount, 0);
        const balanceDue = totalValueWithGst - totalPaid;

        if (Number(amount) > balanceDue) {
            return res.status(400).json({ error: `Payment (₹${amount}) exceeds balance due (₹${balanceDue.toFixed(2)}).` });
        }

        order.payments.push({ amount });
        await purchase.save();
        res.json(transformPurchaseDoc(purchase));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST a received delivery
router.post("/:id/orders/:orderId/deliveries", async (req, res) => {
    try {
        const purchase = await Purchase.findById(req.params.id);
        const order = purchase.purchaseOrders.id(req.params.orderId);
        order.deliveriesReceived.push(req.body);
        await purchase.save();

        const transformed = transformPurchaseDoc(purchase);
        if (transformed.availableStock > purchase.lowStockThreshold && purchase.lowStockAlertSent) {
            purchase.lowStockAlertSent = false;
            await purchase.save();
            console.log("🚩 Stock replenished. Reset lowStockAlertSent flag to FALSE.");
        }
        
        const finalPurchaseState = await Purchase.findById(req.params.id);
        res.json(transformPurchaseDoc(finalPurchaseState));

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// POST a new usage log
router.post("/:id/usage", async (req, res) => {
    try {
        const { usedQty, date } = req.body;
        if (!usedQty || usedQty <= 0) return res.status(400).json({ error: "Valid used quantity is required." });

        const purchase = await Purchase.findById(req.params.id);
        if (!purchase) return res.status(404).json({ error: "Purchase record not found." });

        const tempTransformed = transformPurchaseDoc(purchase);
        const availableStock = tempTransformed.availableStock;

        if (Number(usedQty) > availableStock) {
            return res.status(400).json({ error: `Usage quantity (${usedQty}) exceeds available stock (${availableStock}).` });
        }

        purchase.usageLogs.push({ usedQty: Number(usedQty), date: date ? new Date(date) : new Date() });
        await purchase.save();
        
        const finalTransformed = transformPurchaseDoc(purchase);

        if (finalTransformed.availableStock <= purchase.lowStockThreshold && !purchase.lowStockAlertSent) {
            
            console.log("✅ Conditions MET. Preparing to send email via Nodemailer...");
            
            sendLowStockAlert(
                purchase.materialName,
                purchase.supplierName,
                finalTransformed.availableStock,
                purchase.unit,
                purchase.lowStockThreshold
            );
            
            purchase.lowStockAlertSent = true;
            await purchase.save();
            console.log("🚩 Set lowStockAlertSent flag to TRUE in database.");

        } 
        
        res.json(finalTransformed);
    } catch (error) {
        console.error("🔥 CRITICAL ERROR in usage route:", error);
        res.status(500).json({ error: error.message });
    }
});


// Other usage routes
router.put("/:id/usage/:usageId", async (req, res) => {
    try {
        const purchase = await Purchase.findById(req.params.id);
        const usageLog = purchase.usageLogs.id(req.params.usageId);
        usageLog.set(req.body);
        await purchase.save();
        res.json(transformPurchaseDoc(purchase));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.delete("/:id/usage/:usageId", async (req, res) => {
    try {
        const purchase = await Purchase.findById(req.params.id);
        purchase.usageLogs.id(req.params.usageId).remove();
        await purchase.save();
        res.json(transformPurchaseDoc(purchase));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

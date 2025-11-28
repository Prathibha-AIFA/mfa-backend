import Item from "../models/Item.js";


// GET /items  (list items for the logged-in user, with pagination)
export async function getItems(req, res, next) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not found in token" });
    }

    // page & limit from query
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 5;
    const skip = (page - 1) * limit;

    // run count + items in parallel
    const [items, totalItems] = await Promise.all([
      Item.find({ createdBy: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Item.countDocuments({ createdBy: userId }),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalItems / limit));

    res.json({
      items,
      page,
      limit,
      totalPages,
      totalItems,
    });
  } catch (err) {
    next(err);
  }
}



// POST /items  (create item, MFA REQUIRED)
export async function createItem(req, res, next) {
  try {
    if (!req.user?.mfaVerified) {
      return res.status(403).json({
        message: "Please register in Auth App (MFA) to perform this action.",
      });
    }

    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: "title is required" });
    }

    const item = await Item.create({
      title,
      description: description || "",
      createdBy: req.user.userId,
    });

    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

// PUT /items/:id  (update item, MFA REQUIRED)
export async function updateItem(req, res, next) {
  try {
    if (!req.user?.mfaVerified) {
      return res.status(403).json({
        message: "Please register in Auth App (MFA) to perform this action.",
      });
    }

    const { id } = req.params;
    const { title, description } = req.body;

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // optional: only allow owner to edit
    if (item.createdBy !== req.user.userId) {
      return res.status(403).json({ message: "Not allowed to edit this item" });
    }

    if (title !== undefined) item.title = title;
    if (description !== undefined) item.description = description;

    await item.save();

    res.json(item);
  } catch (err) {
    next(err);
  }
}

// DELETE /items/:id  (delete item, MFA REQUIRED)
export async function deleteItem(req, res, next) {
  try {
    if (!req.user?.mfaVerified) {
      return res.status(403).json({
        message: "Please register in Auth App (MFA) to perform this action.",
      });
    }

    const { id } = req.params;

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // optional: only allow owner to delete
    if (item.createdBy !== req.user.userId) {
      return res.status(403).json({ message: "Not allowed to delete this item" });
    }

    await item.deleteOne();

    res.json({ message: "Item deleted" });
  } catch (err) {
    next(err);
  }
}

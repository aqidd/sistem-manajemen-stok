// 2025-09-16: Implemented /api/items routes (GET, POST, PUT, DELETE) backed by SQLite
import { Router } from 'express';
import { createItem as dbCreate, deleteItem as dbDelete, getAllItems, updateItem as dbUpdate } from '../db.js';
const router = Router();
function validateNewItem(body) {
    return (typeof body?.name === 'string' &&
        typeof body?.unit === 'string' &&
        typeof body?.currentStock !== 'undefined' && !Number.isNaN(Number(body.currentStock)) &&
        typeof body?.requirementPerRecipe !== 'undefined' && !Number.isNaN(Number(body.requirementPerRecipe)) &&
        typeof body?.recipesToday !== 'undefined' && Number.isInteger(Number(body.recipesToday)) &&
        typeof body?.leadTime !== 'undefined' && Number.isInteger(Number(body.leadTime)));
}
function normalizeItem(body) {
    const normalized = {
        name: String(body.name),
        unit: String(body.unit),
        currentStock: Number(body.currentStock),
        requirementPerRecipe: Number(body.requirementPerRecipe),
        recipesToday: Number(body.recipesToday),
        leadTime: Number(body.leadTime),
        supplierWhatsapp: body.supplierWhatsapp ? String(body.supplierWhatsapp) : undefined,
    };
    return normalized;
}
router.get('/', (_req, res) => {
    const items = getAllItems();
    res.json(items);
});
router.post('/', (req, res) => {
    if (!validateNewItem(req.body)) {
        return res.status(400).json({ message: 'Invalid payload' });
    }
    const item = dbCreate(normalizeItem(req.body));
    res.status(201).json(item);
});
router.put('/:id', (req, res) => {
    const { id } = req.params;
    if (!validateNewItem(req.body) && !req.body?.id) {
        return res.status(400).json({ message: 'Invalid payload' });
    }
    const updated = dbUpdate(id, normalizeItem(req.body));
    if (!updated)
        return res.status(404).json({ message: 'Item not found' });
    res.json(updated);
});
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const ok = dbDelete(id);
    if (!ok)
        return res.status(404).json({ message: 'Item not found' });
    res.status(204).send();
});
export default router;

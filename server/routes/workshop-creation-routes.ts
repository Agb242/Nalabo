
import { Router } from 'express';
import { requireAuth } from '../auth';
import { storage } from '../storage';
import { z } from 'zod';

const router = Router();

const createWorkshopSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  estimatedDuration: z.number().min(1),
  steps: z.array(z.any()),
  environmentConfig: z.object({
    type: z.enum(['docker', 'kubernetes']),
    resources: z.object({
      cpu: z.string(),
      memory: z.string(),
      storage: z.string(),
    }),
    manifests: z.string().optional(),
  }),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().default(true),
});

/**
 * @route POST /api/workshops
 * @desc Créer un nouveau workshop
 * @access Private
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const workshopData = createWorkshopSchema.parse(req.body);
    const userId = req.session.userId!;

    const workshop = await storage.createWorkshop({
      ...workshopData,
      creatorId: userId,
      status: 'draft',
    });

    res.status(201).json({
      success: true,
      workshop,
    });
  } catch (error) {
    console.error('Create workshop error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create workshop',
    });
  }
});

/**
 * @route GET /api/workshops
 * @desc Obtenir les workshops (publics + créés par l'utilisateur)
 * @access Private
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const workshops = await storage.getWorkshopsForUser(userId);

    res.json({
      success: true,
      workshops,
    });
  } catch (error) {
    console.error('Get workshops error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get workshops',
    });
  }
});

export { router as workshopCreationRoutes };

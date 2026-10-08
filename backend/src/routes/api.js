const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const vehicleController = require('../controllers/vehicleController');
const tariffController = require('../controllers/tariffController');
const chargingController = require('../controllers/chargingController');
const userController = require('../controllers/userController');
const auditLogController = require('../controllers/auditLogController');
const dashboardController = require('../controllers/dashboardController');
const roleController = require('../controllers/roleController');
const reportController = require('../controllers/reportController');
const { authMiddleware, permissionMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.env.UPLOAD_DIR || 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});
// Auth routes
router.post('/auth/login', authController.login);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password', authController.resetPassword);
router.put('/auth/profile/password', authMiddleware, authController.updatePassword);
router.post('/auth/profile/picture', authMiddleware, upload.single('profile_picture'), authController.updateProfilePicture);
router.delete('/auth/profile/picture', authMiddleware, authController.deleteProfilePicture);

// Dashboard routes
router.get('/dashboard', authMiddleware, dashboardController.getDashboard);

// Vehicle Master routes
router.get('/vehicles', authMiddleware, permissionMiddleware('vehicle.view'), vehicleController.getAll);
router.post('/vehicles', authMiddleware, permissionMiddleware('vehicle.create'), vehicleController.create);
router.put('/vehicles/:id', authMiddleware, permissionMiddleware('vehicle.edit'), vehicleController.update);
router.delete('/vehicles/:id', authMiddleware, permissionMiddleware('vehicle.delete'), vehicleController.remove);

// Tariff Master routes
router.get('/tariffs', authMiddleware, permissionMiddleware('tariff.view'), tariffController.getAll);
router.post('/tariffs', authMiddleware, permissionMiddleware('tariff.create'), tariffController.create);
router.put('/tariffs/:id', authMiddleware, permissionMiddleware('tariff.edit'), tariffController.update);
router.delete('/tariffs/:id', authMiddleware, permissionMiddleware('tariff.delete'), tariffController.remove); // optional, prompt didn't ask for delete tariff but listed it in permissions

// Charging Cycle routes
router.get('/charging', authMiddleware, permissionMiddleware('charging.view'), chargingController.getAll);
router.post('/charging', authMiddleware, permissionMiddleware('charging.create'), chargingController.create);
router.get('/charging/:id', authMiddleware, permissionMiddleware('charging.view'), chargingController.getById);
router.put('/charging/:id', authMiddleware, permissionMiddleware('charging.edit'), chargingController.update);
router.delete('/charging/:id', authMiddleware, permissionMiddleware('charging.delete'), chargingController.remove);

router.post('/charging/:id/start', authMiddleware, permissionMiddleware('charging.start'), chargingController.start);
router.post('/charging/:id/finish', authMiddleware, permissionMiddleware('charging.finish'), chargingController.finish);
router.post('/charging/:id/cancel', authMiddleware, permissionMiddleware('charging.cancel'), chargingController.cancel);


router.post('/charging/:id/evidence', authMiddleware, permissionMiddleware('charging.upload_evidence'), upload.single('evidence'), chargingController.uploadEvidence);

// Reports
router.get('/reports', authMiddleware, permissionMiddleware('report.view'), reportController.getReportData);
router.get('/reports/export', authMiddleware, permissionMiddleware('report.export'), reportController.exportExcel);

// User routes
router.get('/users', authMiddleware, permissionMiddleware('user.view'), userController.getAll);
router.post('/users', authMiddleware, permissionMiddleware('user.create'), userController.create);
router.put('/users/:id', authMiddleware, permissionMiddleware('user.edit'), userController.update);

// Role & Permission routes
router.get('/roles', authMiddleware, permissionMiddleware('user.manage_permission'), roleController.getAll);
router.post('/roles/:id/permissions', authMiddleware, permissionMiddleware('user.manage_permission'), roleController.updatePermissions);

// Audit logs
router.get('/audit-logs', authMiddleware, permissionMiddleware('audit.view'), auditLogController.getAll);

module.exports = router;

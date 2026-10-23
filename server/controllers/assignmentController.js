import path from 'path';
import fs from 'fs';
import { getStore } from '../data/store.js';
import { getUploadsPath, extractFileTextPreview, deleteFile } from '../services/storageService.js';

export const getMyAssignments = async (req, res, next) => {
  try {
    const store = getStore();
    const assignments = await store.assignments.findByUser(req.user.id);
    res.json({
      success: true,
      count: assignments.length,
      data: assignments,
    });
  } catch (err) {
    next(err);
  }
};

export const createAssignment = async (req, res, next) => {
  try {
    const store = getStore();
    const { title, subjectName, description, dueDate, priority, notes } = req.body;

    if (!title || !subjectName) {
      return res.status(400).json({ success: false, message: 'Assignment title and subject name are required.' });
    }

    const files = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        files.push({
          fileName: file.originalname,
          storedFileName: file.filename,
          fileUrl: `/uploads/${file.filename}`,
          fileSize: file.size,
          mimeType: file.mimetype,
          textPreview: extractFileTextPreview(file),
          uploadedAt: new Date(),
        });
      });
    }

    const assignment = await store.assignments.create({
      userId: req.user.id,
      title,
      subjectName,
      description: description || '',
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: priority || 'medium',
      status: 'pending',
      notes: notes || '',
      files,
    });

    res.status(201).json({
      success: true,
      message: 'Assignment created in your Vault',
      data: assignment,
    });
  } catch (err) {
    next(err);
  }
};

export const uploadAssignmentFiles = async (req, res, next) => {
  try {
    const store = getStore();
    const { id } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files provided for upload.' });
    }

    let updatedAssignment = null;
    for (const file of req.files) {
      const fileData = {
        fileName: file.originalname,
        storedFileName: file.filename,
        fileUrl: `/uploads/${file.filename}`,
        fileSize: file.size,
        mimeType: file.mimetype,
        textPreview: extractFileTextPreview(file),
        uploadedAt: new Date(),
      };
      updatedAssignment = await store.assignments.addFile(id, req.user.id, fileData);
    }

    if (!updatedAssignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found in your vault.' });
    }

    res.json({
      success: true,
      message: `${req.files.length} file(s) uploaded successfully`,
      data: updatedAssignment,
    });
  } catch (err) {
    next(err);
  }
};

export const updateAssignmentStatus = async (req, res, next) => {
  try {
    const store = getStore();
    const { status, notes, priority } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;
    if (priority) updates.priority = priority;

    const updated = await store.assignments.update(req.params.id, req.user.id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteAssignment = async (req, res, next) => {
  try {
    const store = getStore();
    const assignment = await store.assignments.findById(req.params.id, req.user.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    // Clean up physical files
    if (assignment.files && assignment.files.length > 0) {
      assignment.files.forEach(f => {
        if (f.storedFileName && !f.fileUrl.startsWith('/uploads/samples/')) {
          deleteFile(f.storedFileName);
        }
      });
    }

    await store.assignments.delete(req.params.id, req.user.id);

    res.json({ success: true, message: 'Assignment and associated files deleted.' });
  } catch (err) {
    next(err);
  }
};

export const downloadAssignmentFile = async (req, res, next) => {
  try {
    const store = getStore();
    const { id, fileName } = req.params;

    const assignment = await store.assignments.findById(id, req.user.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    const fileItem = assignment.files.find(f => f.storedFileName === fileName || f.fileName === fileName);
    if (!fileItem) {
      return res.status(404).json({ success: false, message: 'File not found in this assignment.' });
    }

    // Determine physical path
    let localFilePath = '';
    if (fileItem.fileUrl.startsWith('/uploads/samples/')) {
      localFilePath = path.join(getUploadsPath(), 'samples', path.basename(fileItem.fileUrl));
    } else {
      localFilePath = path.join(getUploadsPath(), fileItem.storedFileName || path.basename(fileItem.fileUrl));
    }

    if (fs.existsSync(localFilePath)) {
      res.download(localFilePath, fileItem.fileName);
    } else {
      // Fallback
      res.setHeader('Content-Disposition', `attachment; filename="${fileItem.fileName}"`);
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.send(`=== UniBot Vault Document ===\nAssignment: ${assignment.title}\nFile: ${fileItem.fileName}\nUploaded: ${fileItem.uploadedAt}\n\nPreview Content:\n${fileItem.textPreview || 'Empty file content'}`);
    }
  } catch (err) {
    next(err);
  }
};

import path from 'path';
import fs from 'fs';
import { getStore } from '../data/store.js';
import { getUploadsPath } from '../services/storageService.js';

export const getAllResources = async (req, res, next) => {
  try {
    const store = getStore();
    const { semester, category, subjectCode, search } = req.query;
    const resources = await store.resources.find({ semester, category, subjectCode, search });
    res.json({
      success: true,
      count: resources.length,
      data: resources,
    });
  } catch (err) {
    next(err);
  }
};

export const getResourceById = async (req, res, next) => {
  try {
    const store = getStore();
    const resource = await store.resources.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    res.json({ success: true, data: resource });
  } catch (err) {
    next(err);
  }
};

export const createResource = async (req, res, next) => {
  try {
    const store = getStore();
    const { title, description, subjectCode, subjectName, semester, category, tags } = req.body;

    if (!title || !subjectCode || !subjectName || !category) {
      return res.status(400).json({ success: false, message: 'Please provide title, subjectCode, subjectName, and category.' });
    }

    let fileUrl = '/uploads/samples/Operating_Systems_Unit2_Notes.pdf';
    let fileName = 'Uploaded_Academic_Doc.pdf';
    let fileSize = 150000;
    let fileType = 'application/pdf';

    if (req.file) {
      fileName = req.file.originalname;
      fileUrl = `/uploads/${req.file.filename}`;
      fileSize = req.file.size;
      fileType = req.file.mimetype;
    }

    const tagArray = tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [];

    const newResource = await store.resources.create({
      title,
      description: description || '',
      subjectCode: subjectCode.toUpperCase(),
      subjectName,
      semester: Number(semester) || 1,
      category,
      fileName,
      fileUrl,
      fileSize,
      fileType,
      uploadedBy: req.user ? req.user.fullName : 'Student Contributor',
      uploaderId: req.user ? req.user.id : null,
      tags: tagArray,
      isVerified: true,
    });

    res.status(201).json({
      success: true,
      message: 'Resource contributed successfully',
      data: newResource,
    });
  } catch (err) {
    next(err);
  }
};

export const toggleUpvote = async (req, res, next) => {
  try {
    const store = getStore();
    const userId = req.user.id;
    const updated = await store.resources.toggleUpvote(req.params.id, userId);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const downloadResource = async (req, res, next) => {
  try {
    const store = getStore();
    const resource = await store.resources.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    await store.resources.incrementDownload(req.params.id);

    // Resolve file path
    let localFilePath = '';
    if (resource.fileUrl.startsWith('/uploads/samples/')) {
      localFilePath = path.join(getUploadsPath(), 'samples', path.basename(resource.fileUrl));
    } else if (resource.fileUrl.startsWith('/uploads/')) {
      localFilePath = path.join(getUploadsPath(), path.basename(resource.fileUrl));
    }

    if (fs.existsSync(localFilePath)) {
      res.download(localFilePath, resource.fileName);
    } else {
      // Fallback: Stream a clean formatted text buffer
      res.setHeader('Content-Disposition', `attachment; filename="${resource.fileName}"`);
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.send(`=== UniBot Academic Resource: ${resource.title} ===\nSubject: ${resource.subjectName} (${resource.subjectCode})\nSemester: ${resource.semester}\nUploaded By: ${resource.uploadedBy}\n\n${resource.description}\n\nSnippet:\n${resource.contentSnippet || 'Full document content verified by faculty.'}`);
    }
  } catch (err) {
    next(err);
  }
};

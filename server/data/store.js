import { initialUsers, initialResources, initialAssignments } from './seedData.js';
import { getDBStatus } from '../config/db.js';
import User from '../models/User.js';
import Resource from '../models/Resource.js';
import Assignment from '../models/Assignment.js';
import ChatSession from '../models/ChatSession.js';

// In-Memory store instances for zero-config fallback
let memoryUsers = [...initialUsers];
let memoryResources = [...initialResources];
let memoryAssignments = [...initialAssignments];
let memoryChatSessions = [];

export const getStore = () => {
  const { isMongoConnected } = getDBStatus();
  return {
    isMongo: isMongoConnected,
    // Methods for User
    users: {
      async findOne(filter) {
        if (isMongoConnected) return await User.findOne(filter);
        if (filter.email) {
          return memoryUsers.find(u => u.email.toLowerCase() === filter.email.toLowerCase());
        }
        if (filter._id || filter.id) {
          const id = filter._id || filter.id;
          return memoryUsers.find(u => u.id === id || u._id === id);
        }
        return null;
      },
      async findById(id) {
        if (isMongoConnected) return await User.findById(id);
        return memoryUsers.find(u => u.id === id || u._id === id);
      },
      async create(userData) {
        if (isMongoConnected) return await User.create(userData);
        const newUser = {
          id: 'user_' + Date.now(),
          _id: 'user_' + Date.now(),
          ...userData,
          createdAt: new Date(),
        };
        memoryUsers.push(newUser);
        return newUser;
      }
    },

    // Methods for Resources
    resources: {
      async find(query = {}) {
        if (isMongoConnected) {
          const mongoQuery = {};
          if (query.semester && query.semester !== 'all') mongoQuery.semester = Number(query.semester);
          if (query.category && query.category !== 'all') mongoQuery.category = query.category;
          if (query.subjectCode && query.subjectCode !== 'all') mongoQuery.subjectCode = query.subjectCode;
          return await Resource.find(mongoQuery).sort({ createdAt: -1 });
        }
        let list = [...memoryResources];
        if (query.semester && query.semester !== 'all') {
          list = list.filter(r => r.semester === Number(query.semester));
        }
        if (query.category && query.category !== 'all') {
          list = list.filter(r => r.category === query.category);
        }
        if (query.subjectCode && query.subjectCode !== 'all') {
          list = list.filter(r => r.subjectCode.toUpperCase() === query.subjectCode.toUpperCase());
        }
        if (query.search) {
          const q = query.search.toLowerCase();
          list = list.filter(r => 
            r.title.toLowerCase().includes(q) || 
            r.subjectName.toLowerCase().includes(q) ||
            r.subjectCode.toLowerCase().includes(q) ||
            (r.tags && r.tags.some(t => t.toLowerCase().includes(q))) ||
            (r.contentSnippet && r.contentSnippet.toLowerCase().includes(q))
          );
        }
        return list;
      },
      async findById(id) {
        if (isMongoConnected) return await Resource.findById(id);
        return memoryResources.find(r => r.id === id || r._id === id);
      },
      async create(data) {
        if (isMongoConnected) return await Resource.create(data);
        const newRes = {
          id: 'res_' + Date.now(),
          _id: 'res_' + Date.now(),
          downloadsCount: 0,
          upvotes: [],
          isVerified: true,
          createdAt: new Date(),
          ...data,
        };
        memoryResources.unshift(newRes);
        return newRes;
      },
      async toggleUpvote(id, userId) {
        if (isMongoConnected) {
          const res = await Resource.findById(id);
          if (!res) return null;
          const idx = res.upvotes.indexOf(userId);
          if (idx > -1) {
            res.upvotes.splice(idx, 1);
          } else {
            res.upvotes.push(userId);
          }
          await res.save();
          return res;
        }
        const item = memoryResources.find(r => r.id === id || r._id === id);
        if (!item) return null;
        if (!item.upvotes) item.upvotes = [];
        const idx = item.upvotes.indexOf(userId);
        if (idx > -1) {
          item.upvotes.splice(idx, 1);
        } else {
          item.upvotes.push(userId);
        }
        return item;
      },
      async incrementDownload(id) {
        if (isMongoConnected) {
          return await Resource.findByIdAndUpdate(id, { $inc: { downloadsCount: 1 } }, { new: true });
        }
        const item = memoryResources.find(r => r.id === id || r._id === id);
        if (item) {
          item.downloadsCount = (item.downloadsCount || 0) + 1;
        }
        return item;
      }
    },

    // Methods for Assignments & Vault
    assignments: {
      async findByUser(userId) {
        if (isMongoConnected) {
          return await Assignment.find({ userId }).sort({ createdAt: -1 });
        }
        return memoryAssignments.filter(a => a.userId === userId);
      },
      async findById(id, userId) {
        if (isMongoConnected) {
          return await Assignment.findOne({ _id: id, userId });
        }
        return memoryAssignments.find(a => (a.id === id || a._id === id) && a.userId === userId);
      },
      async create(data) {
        if (isMongoConnected) return await Assignment.create(data);
        const newAsgn = {
          id: 'asgn_' + Date.now(),
          _id: 'asgn_' + Date.now(),
          files: [],
          status: 'pending',
          createdAt: new Date(),
          ...data,
        };
        memoryAssignments.unshift(newAsgn);
        return newAsgn;
      },
      async update(id, userId, updates) {
        if (isMongoConnected) {
          return await Assignment.findOneAndUpdate({ _id: id, userId }, updates, { new: true });
        }
        const idx = memoryAssignments.findIndex(a => (a.id === id || a._id === id) && a.userId === userId);
        if (idx === -1) return null;
        memoryAssignments[idx] = { ...memoryAssignments[idx], ...updates, updatedAt: new Date() };
        return memoryAssignments[idx];
      },
      async delete(id, userId) {
        if (isMongoConnected) {
          return await Assignment.findOneAndDelete({ _id: id, userId });
        }
        const idx = memoryAssignments.findIndex(a => (a.id === id || a._id === id) && a.userId === userId);
        if (idx === -1) return false;
        memoryAssignments.splice(idx, 1);
        return true;
      },
      async addFile(id, userId, fileData) {
        if (isMongoConnected) {
          const asgn = await Assignment.findOne({ _id: id, userId });
          if (!asgn) return null;
          asgn.files.push(fileData);
          await asgn.save();
          return asgn;
        }
        const asgn = memoryAssignments.find(a => (a.id === id || a._id === id) && a.userId === userId);
        if (!asgn) return null;
        if (!asgn.files) asgn.files = [];
        asgn.files.push(fileData);
        return asgn;
      },
      async removeFile(assignmentId, userId, fileName) {
        if (isMongoConnected) {
          const asgn = await Assignment.findOne({ _id: assignmentId, userId });
          if (!asgn) return null;
          asgn.files = asgn.files.filter(f => f.storedFileName !== fileName && f.fileName !== fileName);
          await asgn.save();
          return asgn;
        }
        const asgn = memoryAssignments.find(a => (a.id === assignmentId || a._id === assignmentId) && a.userId === userId);
        if (!asgn) return null;
        asgn.files = asgn.files.filter(f => f.storedFileName !== fileName && f.fileName !== fileName);
        return asgn;
      }
    },

    // Methods for Chat Sessions
    chats: {
      async findByUser(userId) {
        if (isMongoConnected) {
          return await ChatSession.find({ userId }).sort({ updatedAt: -1 });
        }
        return memoryChatSessions.filter(c => c.userId === userId);
      },
      async findById(id, userId) {
        if (isMongoConnected) {
          return await ChatSession.findOne({ _id: id, userId });
        }
        return memoryChatSessions.find(c => (c.id === id || c._id === id) && c.userId === userId);
      },
      async create(data) {
        if (isMongoConnected) return await ChatSession.create(data);
        const newSession = {
          id: 'chat_' + Date.now(),
          _id: 'chat_' + Date.now(),
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          ...data,
        };
        memoryChatSessions.unshift(newSession);
        return newSession;
      },
      async addMessage(id, userId, messageData) {
        if (isMongoConnected) {
          const session = await ChatSession.findOne({ _id: id, userId });
          if (!session) return null;
          session.messages.push(messageData);
          session.updatedAt = new Date();
          await session.save();
          return session;
        }
        const session = memoryChatSessions.find(c => (c.id === id || c._id === id) && c.userId === userId);
        if (!session) return null;
        session.messages.push({
          id: 'msg_' + Date.now(),
          timestamp: new Date(),
          ...messageData
        });
        session.updatedAt = new Date();
        return session;
      }
    }
  };
};

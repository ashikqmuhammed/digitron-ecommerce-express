const mongoose = require("mongoose");
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    parentId: {
      type: String,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    access: {
        type:Boolean,
        default:false
    },
    blocked: {
      type:Boolean,
      default:false
    },
    edit: {
      type:Boolean,
      default:false
    },
    editTo: {
      type:String,
      default:'default'
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
      required: true
    }

  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
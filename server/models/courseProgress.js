import mongoose from "mongoose";

const lectureProgressSchema = new mongoose.Schema({
  lecture: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lecture",
    required: [true, "Lecture Reference is required"],
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  watchTime: {
    type: Number,
    default: 0,
  },
  lastWatched: {
    type: Date,
    default: Date.now,
  },
});

const courseProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User Reference is required"],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Course Reference is required"],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lectureProgress: [lectureProgressSchema],
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Calculate course completion
courseProgressSchema.pre("save", function (next) {
  if (this.lectureProgress.length > 0) {
    const completedLectures = this.lectureProgress.filtler(
      (lp) => lp.isCompleted
    ).length;
    this.completionPercentage = Math.round(
      (completedLectures / this.lectureProgress.length) * 100
    );
    this.isCompleted = this.completionPercentage === 100;
  }
  next();
});

//Update last acccessed
courseProgressSchema.methods.updateLastAccessed = function () {
  this.lastAccessed = Date.now();
  return this.save({ ValidateBeforeSave: false });
};

export const CourseProgress = mongoose.model(
  "CourseProgress",
  courseProgressSchema
);

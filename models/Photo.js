const { model, Schema } = require("mongoose");

const photoSchema = new Schema({
  src: String,
  createdAt: String,
  public: Boolean,
  owner: String,
  public_id: String,
  description: String,
  tags: [String],
});

module.exports = model("Photo", photoSchema);

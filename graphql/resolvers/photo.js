const cloudinary = require("cloudinary");
var CryptoJS = require("crypto-js");
const { UserInputError } = require("apollo-server");

const checkAuth = require("../../util/checkAuth");
const Photo = require("../../models/Photo");
const config = require("../../config");

cloudinary.config({
  cloud_name: config.CLOUD_NAME,
  api_key: config.API_KEY,
  api_secret: config.API_SECRET,
});

function encryptImageURL(url) {
  return CryptoJS.AES.encrypt(url, config.IMAGE_ENCRYPTION_KEY).toString();
}

function decryptImageURL(url) {
  return CryptoJS.AES.decrypt(url, config.IMAGE_ENCRYPTION_KEY).toString(
    CryptoJS.enc.Utf8
  );
}

async function cloudinaryUploader(
  { url, public, description, tags },
  username
) {
  const data = await cloudinary.uploader.upload(await url, {
    tags: "gotemps",
    resource_type: "auto",
  });
  const photo = new Photo({
    src: encryptImageURL(await data.secure_url),
    createdAt: new Date().toISOString(),
    public,
    public_id: await data.public_id,
    owner: username,
    description,
    tags,
  });
  await photo.save();
  return true;
}

async function deletePic(pic, username) {
  try {
    if (username == pic.owner) {
      await pic.delete();
      cloudinary.uploader.destroy(pic.public_id);
      return true;
    } else {
      throw new AuthenticationError("Picture deletion not allowed");
    }
  } catch (err) {
    throw new Error(err);
  }
}

module.exports = {
  Query: {
    getPublicPictures: async (_, __, context) => {
      let owner = "";
      try {
        const { username } = checkAuth(context);
        owner = username;
      } finally {
        const pics = await Photo.find({
          $or: [
            {
              public: true,
            },
            {
              owner,
            },
          ],
        }).lean();
        return pics.map((pic) => ({
          ...pic,
          id: pic._id,
          src: decryptImageURL(pic.src),
        }));
      }
    },
    getUserPictures: async (_, __, context) => {
      const { username } = checkAuth(context);
      const pics = await Photo.find({ username }).lean();
      return pics.map((pic) => ({
        ...pic,
        id: pic._id,
        src: decryptImageURL(pic.src),
      }));
    },
  },
  Mutation: {
    singlePhotoDelete: async (_, { id }, context) => {
      const { username } = checkAuth(context);
      const pic = await Photo.findById(id);
      if (!pic) {
        throw new UserInputError("Picture " + id + "not found");
      }
      return await deletePic(pic, username);
    },
    multiPhotoDelete: async (_, { ids }, context) => {
      const { username } = checkAuth(context);
      const pics = await Photo.find({ _id: { $in: ids } });
      for (let pic of pics) {
        await deletePic(pic, username);
      }
      return true;
    },
    allPhotoDelete: async (_, __, context) => {
      const { username } = checkAuth(context);
      const pics = await Photo.find({ owner: username });
      for (let pic of pics) {
        await deletePic(pic, username);
      }
      return true;
    },
    singlePhotoUpload: async (_, { photoInput }, context) => {
      const { username } = checkAuth(context);
      return await cloudinaryUploader(photoInput, username);
    },
    multiplePhotoUpload: async (_, { photoInputs }, context) => {
      const { username } = checkAuth(context);
      for (let photoInput of photoInputs) {
        cloudinaryUploader(photoInput, username);
      }
      return true;
    },
  },
};

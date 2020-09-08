const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserInputError } = require("apollo-server");

const { SECRET_KEY } = require("../../config");
const User = require("../../models/Users");
const {
  validateRegisterInput,
  validateLoginInput
} = require("../../util/validators");

async function checkUserExists(username) {
  let user = await User.findOne({ username });
  if (user) {
    throw new UserInputError("Username is taken", {
      errors: {
        username: "This username is taken"
      }
    });
  }
}

async function encryptPassword(password) {
  return await bcrypt.hash(password, 12);
}

async function issueJwtToken(user) {
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username
    },
    SECRET_KEY,
    { expiresIn: "1h" }
  );

  return {
    ...user._doc,
    id: user._id,
    token
  };
}

module.exports = {
  Mutation: {
    async login(_, { username, password }) {
      const { errors, valid } = validateLoginInput(username, password);
      if (!valid) {
        errors.general = "Invalid username/password";
        throw new UserInputError("Invalid Input", { errors });
      }

      const user = await User.findOne({ username });
      if (!user) {
        errors.general = "User does not exist";
        throw new UserInputError("User not found", { errors });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        errors.general = "Wrong Password";
        throw new UserInputError("Wrong Password", { errors });
      }

      return issueJwtToken(user);
    },

    async register(
      _,
      { registerInput: { username, email, password, confirmPassword } },
      context,
      info
    ) {
      const { valid, errors } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      );
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      await checkUserExists(username);

      let date = new Date().toISOString();

      const newUser = new User({
        email,
        username,
        password: await encryptPassword(password),
        createdAt: date
      });

      const user = await newUser.save();

      return await issueJwtToken(user);
    }
  }
};

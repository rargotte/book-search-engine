const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
//const { update } = require('../models/User');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {

        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                    .select('-__v -password')
                return userData;
            }
            console.log("context user:" + context.user);
            throw new AuthenticationError('Please, log in!');
        }
    },

    Mutation: {

        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        },

        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('Credentials are not valid')
            }
            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Credentials are not valid')
            }
            const token = signToken(user);
            return { token, user };
        },

        saveBook: async (parent, { newBook }, context) => {
            console.log("context is: " + context);
            if (context.user) {
                const updatedUser = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBooks: newBook } },
                    { new: true }
                );
                return updatedUser;
            }
            throw new AuthenticationError('You need to be logged in!');
        },

        removeBook: async (parent, { bookId }, context) => {

            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId: bookId } } },
                    { new: true }
                )
                return updatedUser;
            }
        }
    }
};

module.exports = resolvers;
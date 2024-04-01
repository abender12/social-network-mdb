const { User, Thought } = require('../models');

const userController = {
    getAllUsers: async (req, res) => {
      try {
        const dbUserData = await User.find({}).select('-__v').sort({ _id: -1 });
        res.json(dbUserData);
      } catch (err) {
        console.error(err);
        res.sendStatus(500).json(err);
      }
    },

    getUserById: async ({ params }, res) => {
        try {
          const dbUserData = await User.findOne({ _id: params.id })
            .populate({ path: 'thoughts', select: '-__v' })
            .populate({ path: 'friends', select: '-__v' });
    
          if (!dbUserData) {
            return res.status(404).json({ message: 'No User found with this id!' });
          }
    
          res.json(dbUserData);
        } catch (err) {
          console.error(err);
          res.sendStatus(500).json(err);
        }
      },

      createUser: async ({ body }, res) => {
        try {
          const dbUserData = await User.create(body);
          res.json(dbUserData);
        } catch (err) {
          console.error(err);
          res.json(err);
        }
      },

      updateUser: async ({ params, body }, res) => {
        try {
          const updatedUser = await User.findOneAndUpdate({ _id: params.id }, body, { new: true, runValidators: true });
      
          if (!updatedUser) {
            return res.status(404).json({ message: 'No User found with this id!' });
          }
      
          res.json(updatedUser);
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: 'Internal Server Error' });
        }
      },

  // Delete user and users associated thoughts
        deleteUser: async ({ params }, res) => {
            try {
            // Delete all thoughts associated with the user
            await Thought.deleteMany({ userId: params.id });
        
            // Find and delete the user
            const deletedUser = await User.findOneAndDelete({ _id: params.id });
        
            if (!deletedUser) {
                return res.status(404).json({ message: 'No User found with this id!' });
            }
        
            res.json(deletedUser);
            } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal Server Error' });
            }
        },

  // Add a friend to a user's friend list
        addFriend: async ({ params }, res) => {
            try {
            const updatedUser = await User.findOneAndUpdate(
                { _id: params.userId },
                { $push: { friends: params.friendId } },
                { new: true }
            );
        
            if (!updatedUser) {
                return res.status(404).json({ message: 'No user found with this id' });
            }
        
            res.json(updatedUser);
            } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal Server Error' });
            }
        },

  // Delete a friend from a user's friend list
        deleteFriend: async ({ params }, res) => {
            try {
            const updatedUser = await User.findOneAndUpdate(
                { _id: params.userId },
                { $pull: { friends: params.friendId } },
                { new: true }
            );
        
            if (!updatedUser) {
                return res.status(404).json({ message: 'No user found with this id' });
            }
        
            res.json(updatedUser);
            } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal Server Error' });
            }
        },
};

module.exports = userController
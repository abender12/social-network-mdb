const { User, Thought} = require('../models');

const thoughtController = {
  // /api/thoughts

  // Get all thoughts
getAllThoughts: async (req, res) => {
    try {
      const dbThoughtData = await Thought.find({})
        .populate({ path: 'reactions', select: '-__v' })
        .select('-__v')
        .sort({ _id: -1 });
      res.json(dbThoughtData);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },
  
  // Get a single thought by ID
  getThoughtById: async ({ params }, res) => {
    try {
      const dbThoughtData = await Thought.findOne({ _id: params.id })
        .populate({ path: 'reactions', select: '-__v' })
        .select('-__v');
  
      if (!dbThoughtData) {
        return res.status(404).json({ message: 'No thought found with that id!' });
      }
  
      res.json(dbThoughtData);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  // Create a new thought
createThought: async ({ body }, res) => {
    try {
      const createdThought = await Thought.create(body);
      await User.findOneAndUpdate(
        { _id: body.userId },
        { $push: { thoughts: createdThought._id } },
        { new: true }
      );
  
      res.json(createdThought);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },
  
  // Update a thought by ID
  updateThought: async ({ params, body }, res) => {
    try {
      const updatedThought = await Thought.findOneAndUpdate(
        { _id: params.id },
        body,
        { new: true, runValidators: true }
      );
  
      if (!updatedThought) {
        return res.status(404).json({ message: 'No thought found with that id!' });
      }
  
      res.json(updatedThought);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  // Delete a thought by ID
deleteThought: async ({ params }, res) => {
    try {
      const deletedThought = await Thought.findOneAndDelete({ _id: params.id });
  
      if (!deletedThought) {
        return res.status(404).json({ message: 'No thought found with that id!' });
      }
  
      const updatedUser = await User.findOneAndUpdate(
        { _id: params.userId },
        { $pull: { thoughts: params.id } },
        { new: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ message: 'No user found with this id!' });
      }
  
      res.json(updatedUser);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },
  
  // Create a reaction for a thought
  createReaction: async ({ params, body }, res) => {
    try {
      const updatedThought = await Thought.findOneAndUpdate(
        { _id: params.thoughtId },
        { $push: { reactions: body } },
        { new: true, runValidators: true }
      ).populate({ path: 'reactions', select: '-__v' }).select('-__v');
  
      if (!updatedThought) {
        return res.status(404).json({ message: 'No thought found with this ID.' });
      }
  
      res.json(updatedThought);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  // Delete a reaction from a thought
deleteReaction: async ({ params }, res) => {
    try {
      const updatedThought = await Thought.findOneAndUpdate(
        { _id: params.thoughtId },
        { $pull: { reactions: { reactionId: params.reactionId } } },
        { new: true }
      );
  
      if (!updatedThought) {
        return res.status(404).json({ message: 'No thought found with that ID.' });
      }
  
      res.json(updatedThought);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }


};

module.exports = thoughtController
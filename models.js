const mongoose = require('mongoose');

const blogPostSchema = mongoose.Schema({
  title: {type: String, required: true},
  author: {
    firstName: String,
    lastName: String
  },
  content: {type: String, required: true},
  created: {date: Date}
});


blogPostSchema.virtual('authorString').get(() => {
  return `${this.author.firstName} ${this.author.lastName}`});


blogPostSchema.methods.apiRepr = () => {
  return {
    id: this._id,
    title: this.title,
    author: this.authorString,
    content: this.content,
    created: this.created
  };
}

const BlogPost = mongoose.model('Blogpost', blogPostSchema);

module.exports = {BlogPost};



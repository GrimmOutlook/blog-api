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


blogPostSchema.virtual('authorName').get(function() {
  return `${this.author.firstName} ${this.author.lastName}`; //trim()
});

// var abbreviations = fakeTitles.map(
//     title => title.toLowerCase().slice(0, 3));

// blogPostSchema.virtual('authorString').get(
//   () => `${this.author.firstName} ${this.author.lastName}`);


blogPostSchema.methods.apiRepr = function() {
  console.log(this);
  return {
    id: this._id,
    author: this.authorName,
    content: this.content,
    title: this.title,
    created: this.created
  };
}

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

module.exports = {BlogPost};



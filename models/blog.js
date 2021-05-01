const mongoose = require('mongoose'),
Comment = require('./comment')

const imageSchema = new mongoose.Schema({
	url: String,
	filename: String
});

//used on the edit screen for the blogs
imageSchema.virtual('thumbnail').get(function() { //virtual property: not stored in the db.
	return this.url.replace('/upload', '/upload/w_200') 
	//cloudinary '/w_xxx' on the url returns an img thumbnail of the specified size
});

const blogSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	images: [imageSchema],
	body: {
		type: String,
		required: true
	},
	created: {
		type: Date, 
		default: Date.now()
	}, 
	author: {
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'User'
	},
	comments: [ {
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'Comment'
	} ]
	//Store a reference to the comment schema and a comment document's id
})

//mongoose middleware function to delete the blog's associated comments
blogSchema.post('findOneAndRemove', async function(doc) {
	if (doc) {
		await Comment.deleteMany({
			_id: {
				$in: doc.comments //delete all comments in the comments array of this deleted blog post
			}
		})
	}
  })

module.exports = mongoose.model('Blog', blogSchema)
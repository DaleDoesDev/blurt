const mongoose = require('mongoose')

let commentSchema = new mongoose.Schema ({
    author: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    },
    body: {
        type: String,
		required: true
    },
    created: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model('Comment', commentSchema)
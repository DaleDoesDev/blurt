module.exports.validateNotEmpty = (received) => {
    expect(received).not.toBeNull();
    expect(received).not.toBeUndefined();
    expect(received).toBeTruthy();
  };

module.exports.validateUserDuplicationError = (name) => {
    expect(name).toEqual('UserExistsError');
  };

module.exports.validateBlogAuthor = (newBlog, regUser) => {
  expect(newBlog._id).toBeDefined();
  expect(regUser._id).toBeDefined();
  expect(newBlog.author).toEqual(regUser._id) //stored the author correctly. 
};

module.exports.validateBlogSchema = (name) => {
  expect(name).toEqual('ValidationError');
};


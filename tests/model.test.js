const User = require('../models/user');
const Blog = require('../models/blog');
const { dbConnect, dbDisconnect } = require('../utils/dbHandler');
const { validateNotEmpty, 
        validateUserDuplicationError, 
        validateBlogAuthor, 
        validateBlogSchema } = require('./validators/testValidators');

beforeAll(async () => dbConnect());
afterAll(async () => dbDisconnect());

describe('blurt. user testing suite', () => {

  let email = "ex@ex.com";
  let username = "tester123";
  let password = "Test_2021";

  test('create a new user instance, register them & add them to the db', async () => {
    const user = new User({email, username});
    validateNotEmpty(user);
    const regUser = await User.register(user, password);
    validateNotEmpty(regUser);
  })

  test('should return duplicate user error', async () => {
    try {
      const user = new User({email, username});
      const regUser = await User.register(user, password);
    } catch (error) {
      const {name} = error;
      validateUserDuplicationError(name);
    }
  });

    // Test Schema is working
    // You shouldn't be able to add in any field that isn't defined in the schema
    test('ensure schema validation by attempting to add a user with an undefined field', async () => {
      const userWithInvalidField = new User({ email: 'none@no.com', username: 'testing', nickname: 'Duck' });
      const savedUserWithInvalidField = await userWithInvalidField.save();
      expect(savedUserWithInvalidField._id).toBeDefined();
      expect(savedUserWithInvalidField.nickkname).toBeUndefined();
  });

});

describe('blurt. blog posting testing suite', () => {

  test('make a new blog post with a newly registered user', async () => {
    const user = new User({email: 'no@nope.co', username: 'tester15'});
    const regUser = await User.register(user, 'Test_2021');
    validateNotEmpty(regUser);

    const newBlog =  await Blog.create (
      {
        title: "Example",
        author: `${regUser._id}`,
        images: [
          {   
            url: 'https://res.cloudinary.com/dtcgdx66j/image/upload/v1619424455/restProjectSeeds/photo-1467810563316-b5476525c0f9_r9l1d6.jpg',
            filename: 'restProjectSeeds/photo-1467810563316-b5476525c0f9_r9l1d6.jpg'
          }
        ],
        body: "     Lorem ipsum dolor sit amet consectetur adipisicing elit."
    });
  
    await newBlog.save();
    validateNotEmpty(newBlog);
    validateBlogAuthor(newBlog, regUser);
  })

  test('new blog post missing a schema required field', async () => {
    const user = new User({email: 'no@nooo.com', username: 'tester17'});
    const regUser = await User.register(user, 'Test_2021');
    validateNotEmpty(regUser);

    try {
      const newBlog =  await Blog.create (
        {
          title: "",
          author: `${regUser._id}`,
          body: "     Lorem ipsum dolor sit amet consectetur adipisicing elit."
      });
      await newBlog.save();
    } catch (error) {
      const {name} = error;
      validateBlogSchema(name);
    }
  });

});



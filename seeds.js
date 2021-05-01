
if (process.env.NODE_ENV !== "production") {
  require('dotenv').config(); //for the .env file hiddle values
}

const mongoose = require('mongoose'),
Blog = require('./models/blog'),
Comment = require('./models/comment'),
User = require('./models/user'),
dbUrl = process.env.DB_URL

//mongoose connection
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message))

//create 2 test users and several example blog posts
const alterDb = async () => {
    //wipe DB 
    await User.deleteMany({});
    await Comment.deleteMany({});
    await Blog.deleteMany({});

    let email = "example@example.com";
    let username = "admin";
    let password = "Admin_2021";
    const user = new User({email, username});
    const registeredUser = await User.register(user, password);

     email = "exampleUser@ex.com";
     username = "testuser";
     password = "Test_2021";
     const userTwo = new User({email, username});
     const registeredUserTwo = await User.register(userTwo, password);

    await Blog.create(
      {
        title: "Single Image Blog Post",
        author: `${registeredUser._id}`, 
        images: [
          {   
            url: 'https://res.cloudinary.com/dtcgdx66j/image/upload/v1619424455/restProjectSeeds/photo-1467810563316-b5476525c0f9_r9l1d6.jpg',
            filename: 'restProjectSeeds/photo-1467810563316-b5476525c0f9_r9l1d6.jpg'
          }
        ],
        body: "     Lorem ipsum dolor sit amet consectetur adipisicing elit. Iure corrupti itaque labore harum numquam temporibus veritatis voluptas accusamus tempora qui voluptatum modi enim aperiam quaerat, expedita, praesentium dolorum sit. Qui animi reprehenderit, rem maiores fugit rerum et numquam quo repellat, officiis, at eos aliquid obcaecati!\n     Exercitationem quas, dicta facere velit molestiae maiores necessitatibus perferendis suscipit. Nobis consequuntur incidunt obcaecati laboriosam quos doloremque labore ea! Eaque, sed aliquid! Libero similique corporis laudantium! Alias porro exercitationem vel architecto aliquam quas veritatis quibusdam non minima, accusamus nulla labore maiores quia sed. Quam labore consequuntur similique dolorem. Accusamus facere recusandae tempora fugit! Magni, possimus!"
    },
    {
      title: "Short Post with Multiple Images",
      author: `${registeredUserTwo._id}`, 
      images: [
        {   
          url: 'https://res.cloudinary.com/dtcgdx66j/image/upload/v1619424456/restProjectSeeds/photo-1533134242443-d4fd215305ad_lsur3t.jpg',
          filename: 'restProjectSeeds/photo-1533134242443-d4fd215305ad_lsur3t.jpg'
        },
        {   
          url: 'https://res.cloudinary.com/dtcgdx66j/image/upload/v1619424456/restProjectSeeds/photo-1616951851345-5290af91bfdb_r72oku.jpg',
          filename: 'restProjectSeeds/photo-1616951851345-5290af91bfdb_r72oku.jpg'
        }
      ],
      body: "     Accusamus facere recusandae tempora fugit! Magni, possimus!"
    },
    {
      title: "3rd Example Blog Post",
      author: `${registeredUserTwo._id}`, 
      images: [
        {   
          url: 'https://res.cloudinary.com/dtcgdx66j/image/upload/v1619424455/restProjectSeeds/photo-1503342217505-b0a15ec3261c_zsxzxa.jpg',
          filename: 'restProjectSeeds/photo-1503342217505-b0a15ec3261c_zsxzxa.jpg'
        }
      ],
      body: "     Qui animi reprehenderit, rem maiores fugit rerum et numquam quo repellat, officiis, at eos aliquid obcaecati!\n     Exercitationem quas, dicta facere velit molestiae maiores necessitatibus perferendis suscipit. Nobis consequuntur incidunt obcaecati laboriosam quos doloremque labore ea!"
    },
    {
      title: "Additional Multi-Image Post",
      author: `${registeredUser._id}`, 
      images: [
        {   
          url: 'https://res.cloudinary.com/dtcgdx66j/image/upload/v1619424456/restProjectSeeds/photo-1586170321137-6e8fcac313d6_vrpige.jpg',
          filename: 'restProjectSeeds/photo-1586170321137-6e8fcac313d6_vrpige.jpg'
        },
        {   
          url: 'https://res.cloudinary.com/dtcgdx66j/image/upload/v1619424455/restProjectSeeds/photo-1450101499163-c8848c66ca85_riarjw.jpg',
          filename: 'restProjectSeeds/photo-1450101499163-c8848c66ca85_riarjw.jpg'
        }
      ],
      body: "     Lorem ipsum dolor sit amet consectetur adipisicing elit. Iure corrupti itaque labore harum numquam temporibus veritatis voluptas accusamus tempora qui voluptatum modi enim aperiam quaerat, expedita, praesentium dolorum sit. Qui animi reprehenderit, rem maiores fugit rerum et numquam quo repellat, officiis, at eos aliquid obcaecati!\n     Exercitationem quas, dicta facere velit molestiae maiores necessitatibus perferendis suscipit. Nobis consequuntur incidunt obcaecati laboriosam quos doloremque labore ea! Eaque, sed aliquid! Libero similique corporis laudantium! Alias porro exercitationem vel architecto aliquam quas veritatis quibusdam non minima, accusamus nulla labore maiores quia sed. Quam labore consequuntur similique dolorem. Accusamus facere recusandae tempora fugit! Magni, possimus!"
    }
    )
}

alterDb()
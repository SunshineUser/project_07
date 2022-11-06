const {
    client,
    createUser,
    updateUser,
    getAllUsers,
    getUserById,
    createPost,
    updatePost,
    getAllPosts,
    createTags,
    addTagsToPost,
    getPostsByTagName,
} = require('./index');

async function createInitialPosts(){
    try{
        console.log("create teh posts.....")
        const[albert, sandra, glamgal] = await getAllUsers();

        await createPost({
            authorId: albert.id,
            title: "First Post",
            content: "This is my first post. I hope I love writing blogs as much as I love writing them. (what is this?)",
            tags: ["#happy","#youcandoanything"]
        });

        await createPost({
            authorId: sandra.id,
            title: "How does this work?",
            content: "Seriously, does this even do anything?",
            tags: ["#happy","#worst-day-ever"]
        });

        await createPost({
            authorId: glamgal.id,
            title: "I will absorb the entire universe with my Glamgal powers",
            content: "Do you even? I swear that half of you are posing.",
            tags: ["#happy","#youcandoanything","#catmandoeverything"]
        });
    
        console.log("Finished created posts!");

    } catch(error) {
       console.log("posts not created, massive error")
    }
}
async function createInitialUsers(){
    try{
        // console.log("Starting to create users...");

        const albert = await createUser({ username: 'albert', password: 'bertie99', name: 'albert', location:'friday'});
        const sandra = await createUser({ username:'sandra', password: 'passwordsarebad',name: 'sandra',location: 'at a bar' });
        const glamgal = await createUser({ username:'glamgal', password: 'glamgalmanderglamgal',name: 'glamgal', location: 'under the stairs'});
        
        // console.log(albert);
        // console.log(sandra);
        // console.log(glamgal);
        // console.log("Finished creating users!");

    } catch(error){
        console.error("Error creating users!")
        throw error;
    }
}
async function createInitialTags(){
    try{
        console.log("Starting to create tags... ");

        const [happy, sad, inspo, catman] = await createTags([
            '#happy',
            '#worst-day-ever',
            '#youcandoanything',
            '#catmandoeverything'
        ]);

        const [postOne, postTwo, postThree]= await getAllPosts();

        await addTagsToPost(postOne.id, [happy, inspo]);
        await addTagsToPost(postTwo.id, [sad, inspo]);
        await addTagsToPost(postThree.id, [happy, catman, inspo]);

        console.log("Finished creating tags!")
    } catch(error){
        console.log("error creating tags")
        throw error;
    }
}

async function dropTables(){
    console.log("dropping table users....")
    try{
        await client.query(`
        DROP TABLE IF EXISTS post_tags;
        DROP TABLE IF EXISTS tags;
        DROP TABLE IF EXISTS posts;
        DROP TABLE IF EXISTS users;
        `);

        console.log("tables dropped!")
    }catch(error){

        console.error("Error dropping tables!");
        throw error;
    }
}

async function createTables(){
    try{
        console.log("creating tables...");
        await client.query(`
        CREATE TABLE users(
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            location VARCHAR(255) NOT NULL,
            active BOOLEAN DEFAULT true
        );
        CREATE TABLE posts(
            id SERIAL PRIMARY KEY,
            "authorId" INTEGER REFERENCES users(id),
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            active BOOLEAN DEFAULT true
        );
        CREATE TABLE tags(
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL
        );
        CREATE TABLE post_tags(
            "postId" INTEGER REFERENCES posts(id),
            "tagId" INTEGER REFERENCES tags(id),
            UNIQUE ("postId", "tagId")
        );
        `);

        console.log("Tables have been created ");
    }catch(error){
        console.error("Error building tables!")
        throw error;
    }
}

async function rebuildDB(){
    try{
        client.connect();
        console.log( "<<<<<--------------------CONNECTING--------------------->>>>>>") 
        console.log( "<<<<<--------------------CONNECTING--------------------->>>>>>") 
        console.log( "<<<<<--------------------CONNECTING--------------------->>>>>>") 
        console.log( "<<<<<--------------------CONNECTING--------------------->>>>>>") 
        console.log( "<<<<<--------------------CONNECTING--------------------->>>>>>") 
        await dropTables();
        await createTables();
        await createInitialUsers();
        await createInitialPosts();
        await testDB();
    } catch(error){
        console.error(error)
    } finally{
        client.end();
    }
}

async function testDB(){
    try {
        // connect to the client to database, finally
        console.log("starting to test databayyo");

        await createInitialTags();
        const users = await getAllUsers();
        const posts = await getAllPosts();
        console.log("Calling updatePost on posts[1], only update tags");
        console.log(posts);
        const updatePostTagsResult = await updatePost(posts[1].id,{
            tags: ["#youcandoanything","#redfish","#bluefish"]
        });
        console.log("Result:", updatePostTagsResult);
        console.log("Calling getPostsByTagName with #happy");
        const postsWithHappy = await getPostsByTagName("#happy");
        console.log("Result:", postsWithHappy)
        await Promise.all([
            
            updateUser(users[0].id,{
                name: "Newname Sogood",
                location: "Lesterville, KY"
            }),

            updatePost(posts[0].id,{
                title: "haha I'm making my own title",
                content: "this content has been updated"
            }),

            getUserById(1)
        ])
        console.log("Finished database test!");
    } catch(error) {
        console.log("Error testing database!")
        throw error;
    }
}

rebuildDB()
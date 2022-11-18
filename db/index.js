const { Client } = require('pg');
const client = new Client({
    host: process.env.DB_HOSTNAME || "localhost",
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || "juicebox-dev",
    username: process.env.DB_USERNAME || undefined,
    password: process.env.DB_PASSWORD || undefined,
    connectionString: process.env.DB_URL || 'postgres://localhost:5432/juicebox-dev',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  });

async function getAllUsers(){
    const { rows } = await client.query(
        `SELECT id, username, name, location, active
        FROM users;
        `);
        console.log("all users", rows);
    return rows;
}

async function getAllTags(){
    const { rows } = await client.query(
        `SELECT * FROM tags;`
    )
    console.log("all tags ", rows);
    return rows;
}

async function getAllUsers(){
    const { rows } = await client.query(
        `SELECT id, username, name, location, active
        FROM users;
        `);
        console.log("all users", rows);
    return rows;
}

async function createUser({
    username,
    password,
    name,
    location
}){
    try{//interpolated placeholders
        const { rows:  [ user ] } = await client.query(`
            INSERT INTO users(username, password, name, location)
            VALUES ($1, $2, $3, $4)  
            ON CONFLICT (username) DO NOTHING
            RETURNING *;
            `,
            [ username, password, name, location]);
        console.log(user, "we are inside the function");
        return user
    }catch(error){
        throw (error) //in the trash
    }
}
     ////                 (id), fields={vin= 235425321456,color=blue}
async function updateUser(id, fields = {}){
    console.log("updating users....")
    const setString = Object.keys(fields)
    .map( (key, index) => 
    
    
    `"${ key }"=$${ index + 1}`  // ($1, $2, $3)
        ).join(', ');
    if (setString.length === 0){
        return;
    }
    
    try{
        const { rows:  [ user ] } = await client.query(`
            UPDATE users SET ${ setString }
            WHERE id=${ id } RETURNING *;`
            , Object.values(fields));

            console.log("Result:", user);
        return user;
    }catch (error){
        console.log(error);
    }
}

async function createPost({ authorId, title, content, tags=[] }) {
    try{
        const { rows:  [ post ] } = await client.query(`
        INSERT INTO posts ("authorId", title, content)
        VALUES ($1, $2, $3) 
        RETURNING *;
        `,
        [ authorId, title, content ]);

        const tagList = await createTags(tags);

        return await addTagsToPost(post.id, tagList);
    }catch(error){
        throw error;
    }
}

async function updatePost(postId, fields={}){
    console.log("Calling updatepost... posts[0]");
    const { tags } = fields;
    delete fields.tags;
    
    const setString = Object.keys(fields).map(
        //interpolated insert that allows the method chain to send an object value into sql
        (key, index) => `"${ key }"=$${ index + 1}`
        ).join(', ');

    if (setString.length === 0){
        return;
    }
    
    try {

        if(setString.length > 0){
            await client.query(`
            UPDATE posts
            SET ${ setString }
            WHERE id=${ postId }
            RETURNING *;
            `, Object.values(fields));
        }

        if(tags === undefined) {
            return await getPostById(postId);
        }

        const tagList = await createTags(tags);
        const tagListIdString = tagList.map(
            tag => `${ tag.id }`
            ).join(', ');

        await client.query(`
            DELETE FROM post_tags
            WHERE "tagId"
            NOT IN (${ tagListIdString })
            AND "postId"=$1;
            `, [postId]);
        
        await addTagsToPost(postId, tagList);

        return await getPostById(postId)
        // const { rows:  [ post ] } = await client.query(`
        //     UPDATE posts
        //     SET ${ setString }
        //     WHERE id=${ id }
        //     RETURNING *;
        //     `, Object.values(fields));
        // console.log("Result: ", post);
        // return post;
        }catch(error){
            throw error;
        }
}

async function getAllPosts(){
    console.log("GetallPosts......")
    try{
        const { rows: postIds } = await client.query(
        `SELECT id
         FROM posts;
        `);

    const posts = await Promise.all(postIds.map(
        post=> getPostById( post.id )
    ));

    console.log("Posts!: ");
    return posts;

    }catch (error){
        throw error
    }
    
}

async function getPostsByUser(userId){
    try{
        const{ rows: postIds } = await client.query(`
        SELECT id
        FROM posts
        WHERE "authorId"=${ userId };
        `);

        const posts = await Promise.all(postIds.map(
            post=> getPostById( post.id )
        ));

        return posts;
    }catch (error){
        throw error;
    }
}
async function getUserById(userId){
    console.log("Calling getUserById with 1");
    try{
    if (!userId) {
        return null
    }
    const { rows: [user] } = await client.query(`
        SELECT * FROM users WHERE id=${ userId }
    `);

    user.posts = await getPostsByUser(userId);
    console.log("Result: ", user);
    return user;
    } catch(error){
        throw error;
    }
}

async function createTags(tagList){
    if(tagList.length ===0){
        return;
    }
    const insertValues = tagList.map(
        (_, index) => `$${index +1}`).join('), (');
    
    const selectValues = tagList.map(
        (_, index) => `$${index + 1}`).join(', ');
    try{
        await client.query(`
            INSERT INTO TAGS (name)
            VALUES (${insertValues})
            ON CONFLICT (name) DO NOTHING RETURNING*;
        `, tagList)
        const { rows } = await client.query(`
            SELECT * FROM tags
            WHERE name IN (${selectValues});
            `, tagList)
        console.log('from createTags func: ', rows);
        return rows;
    }catch(error){
        throw error;
    }
}
async function createPostTag(postId, tagId){
    try{
        await client.query(`
        INSERT INTO post_tags("postId", "tagId")
        VALUES ($1, $2)
        ON CONFLICT ("postId", "tagId") DO NOTHING;
        `, [postId, tagId]);
    } catch(error) { 
        console.log(error);
    }
}

async function addTagsToPost(postId, tagList){
    try{
        console.log(tagList);
        const createPostTagPromises = tagList.map(
            tag => createPostTag(postId, tag.id)
        );
        await Promise.all(createPostTagPromises);
        
        return await getPostById(postId);
    } catch (error){
        throw error;
    }
}

async function getPostById(postId){
    try{
        const { rows: [ post ] } = await client.query(`
        SELECT *
        FROM posts
        WHERE id =$1;
        `, [postId]);
        
        if(!post){
            throw{
                name: "PostNOTFOUNDERR",
                message:"COULD NOT FIND POST WITH THAT POSTID"
            }
        }


        const { rows: tags } = await client.query(`
            SELECT tags.*
            FROM tags
            JOIN post_tags ON tags.id=post_tags."tagId"
            WHERE post_tags."postId"=$1;
            `, [postId]);

        const { rows: [author] } = await client.query(`
            SELECT id, username, name, location
            FROM users
            WHERE id=$1;
            `, [post.authorId])
        
        post.tags = tags;
        post.author = author;

        delete post.authorId;

        return post;
    } catch(error){
        console.log(error)
    }
}

async function getPostsByTagName(tagName) {
    try {
        const{ rows: postIds } = await client.query(`
        SELECT posts.id
        FROM posts
        JOIN post_tags ON posts.id=post_tags."postId"
        JOIN tags ON tags.id=post_tags."tagId"
        WHERE tags.name=$1;
        `, [tagName]);
        return await Promise.all(postIds.map(
            post => getPostById(post.id)
        ));
    } catch(error){
        console.log("this is get posts error")
        throw error
    }
}

async function getUserByUsername(username){
    try{
        const { rows: [user] } = await client.query(`
        SELECT * FROM users
        WHERE username = $1;
        `, [username]);
        return user;
    } catch(error){
        throw error;
    }
}

module.exports = {
    client,
    createTags,
    updateUser,
    getUserById,
    createPost,
    updatePost,
    getAllPosts,
    getPostsByTagName,
    addTagsToPost,
    getAllTags,
    getAllUsers,
    createUser,
    getUserByUsername,
    getPostById
}
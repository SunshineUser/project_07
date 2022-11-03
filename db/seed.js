const {
    client,
    getAllUsers,
    createUser
} = require('./index');

async function createInitialUsers(){
    try{
        console.log("Starting to create users...");

        const albert = await createUser({ username: 'albert', password: 'bertie99'});
        const sandra = await createUser({ username:'sandra', password: 'passwordsarebad' });
        const glamgal = await createUser({ username:'glamgal', password: 'glamgalmanderglamgal'})

        console.log(albert);
        console.log(sandra);
        console.log(glamgal);
        console.log("Finished creating user!");

    } catch(error){
        console.error("Error creating users!")
        throw error;
    }
}

async function dropTables(){
    console.log("dropping table users....")
    try{

        await client.query(`
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
            password VARCHAR(255) NOT NULL
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


        await dropTables();
        await createTables();  
        await createInitialUsers();
    } catch(error){
        console.error(error)
    } 
}

async function testDB(){
    try {
        // connect to the client to database, finally
        console.log("starting to test databayyo");
        
        const users = await getAllUsers();
        console.log("all users", users);
        
        console.log("Finished database test!");
    } catch(error) {
        console.log(error)
        throw error;
    }
}

rebuildDB()
    .then(testDB)
    .catch(console.error)
    .finally(()=>client.end());

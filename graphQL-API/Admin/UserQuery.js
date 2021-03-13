const { GraphQLObjectType, GraphQLList } = require('graphql');
const userType = require('./UserType');
const queryFunction = require('../../dBConfig/queryFunction');
const path = require('path');
const fs = require('fs');
const comparePassword = require('../../_helpers/decrypt');

const _statement = fs.readFileSync(path.join(__dirname + '/../../sql/Admin/allUsers.sql')).toString();

const UserQuery = new GraphQLObjectType({
    name: 'UserQuery',
    fields: () => {
        return {
            users: {
                type: new GraphQLList(userType),
                resolve: async () => {
                    const users = await queryFunction(_statement)
                    if(!users) {
                        throw new Error('Error while fetching data')
                    }
                    return users;
                }
            },
            user: {
                type: userType,
                args: {
                    username: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    clientPassword: {
                        type: GraphQLString
                    }
                },
                resolve: async (root, args) => {

                    const user = await queryFunction(_statement, args.username)
                    if(!user) {
                        throw new Error("User does not exist");
                    } else if(!comparePassword(args.clientPassword, user.password)) {
                        throw new Error("Login Crendentials do not match")
                    }
                    return "Login Successful"
                }
            }
        }
    }
});

module.exports = UserQuery;
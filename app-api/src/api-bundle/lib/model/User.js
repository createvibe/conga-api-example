/**
 * @Bass:Document(collection="users", repository="../repository/UserRepository")
 * @-Listener(listener="my.model.listener", events=["prePersist","postPersist"])
 * @Rest:Object
 */
function User() {
    this.roles = [];
}

User.prototype = {
    /**
     * @Bass:Id
     * @Bass:Field(type="ObjectID", name="_id")
     * @Rest:Property
     */
    id: null,

    /**
     * @Bass:Field(type="String", name="email")
     * @Rest:Property
     * @Assert:NotBlank
     * @-Assert:Regex(pattern="^[^@]+@\.[a-z]{2,}")
     */
    email: null,

    /**
     * @Bass:Field(type="String", name="password")
     * @Rest:Property
     * @Assert:NotBlank
     */
    password: null,

    /**
     * @Bass:Field(type="String", name="salt")
     */
    salt: null,

    /**
     * @Bass:Field(type="Array", name="roles")
     */
    roles: null,

    /**
     * @Bass:Field(type="String", name="first_name")
     * @Assert:NotBlank
     * @Rest:Property
     */
    firstName: null,

    /**
     * @Bass:Field(type="String", name="last_name")
     * @Assert:NotBlank
     * @Rest:Property
     */
    lastName: null,

    /**
     * @Bass:Version
     * @Bass:Field(type="Number", name="version")
     * @Rest:Property
     */
    version: 0,

    /**
     * @Bass:CreatedAt
     * @Bass:Field(type="Date", name="created_at")
     * @Rest:Property
     */
    createdAt: null,

    /**
     * @Bass:UpdatedAt
     * @Bass:Field(type="Date", name="updated_at")
     * @Rest:Property
     */
    updatedAt: null,

    /**
     * Get the user roles
     * @returns {Array<String>}
     */
    getRoles: function() {
        return this.roles;
    },

    /**
     * @Rest:SerializeMethod
     * @returns {Object}
     */
    toJSON: function () {
        return {
            id: this.id,
            email: this.email,
            firstName: this.firstName,
            lastName: this.lastName,
            version: this.version,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
};

User.prototype.constructor = User;

module.exports = User;
class AuthRoles {
    constructor() {
        this.usersCollection = firebase.firestore().collection('users');
    }

    async setUserRole(userId, role = 'user') {
        try {
            await this.usersCollection.doc(userId).set({
                role: role,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            console.log(`Role '${role}' set for user ${userId}`);
        } catch (error) {
            console.error('Error setting user role:', error);
            throw error;
        }
    }

    async getUserRole(userId) {
        try {
            const doc = await this.usersCollection.doc(userId).get();
            return doc.exists ? doc.data().role : null;
        } catch (error) {
            console.error('Error getting user role:', error);
            throw error;
        }
    }
}

// Create global instance
window.authRoles = new AuthRoles(); 
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { createClient } from "@supabase/supabase-js";
import NavBar from "../components/NavBar";
import "../App.css";

const supabase = createClient(
    process.env.REACT_APP_SUPABASE_URL,
    process.env.REACT_APP_SUPABASE_ANON_KEY
);

function Admin() {
    const [session, setSession] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginError, setLoginError] = useState("");

    const [images, setImages] = useState([]);
    const [users, setUsers] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [view, setView] = useState("images");

    // Auth: check session on mount and listen for changes
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session: s } }) => {
            setSession(s);
            setAuthLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, s) => setSession(s)
        );

        return () => subscription.unsubscribe();
    }, []);

    // Create authenticated axios instance
    const authAxios = useCallback(() => {
        if (!session) return axios;
        return axios.create({
            headers: {
                Authorization: `Bearer ${session.access_token}`,
            },
        });
    }, [session]);

    // Fetch data when session is available
    useEffect(() => {
        if (session) {
            fetchImages();
            fetchUsers();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError("");

        const { error } = await supabase.auth.signInWithPassword({
            email: loginEmail,
            password: loginPassword,
        });

        if (error) {
            setLoginError(error.message);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setSession(null);
        setImages([]);
        setUsers([]);
    };

    // Fetch images (public endpoint, no auth needed)
    const fetchImages = async () => {
        try {
            const response = await axios.get("/api/images");
            setImages(response.data);
        } catch (error) {
            console.error("Error fetching images:", error);
        }
    };

    // Fetch users (auth required)
    const fetchUsers = async () => {
        try {
            const response = await authAxios().get("/api/subscribers");
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    // Handle inline updates for images
    const handleUpdateImage = async (id, field, value) => {
        try {
            const updatedImage = { ...images.find(img => img._id === id), [field]: value };
            setImages(images.map(img => (img._id === id ? updatedImage : img)));

            await authAxios().put(`/api/images/${id}`, { [field]: value });
        } catch (error) {
            console.error("Error updating image:", error);
        }
    };

    // Handle Delete Image
    const handleDeleteImage = async (id) => {
        if (!window.confirm("Are you sure you want to delete this image?")) return;
        try {
            await authAxios().delete(`/api/images/${id}`);
            setImages(images.filter(image => image._id !== id));
        } catch (error) {
            console.error("Error deleting image:", error);
        }
    };

    // Handle inline updates for users
    const handleUpdateUser = async (id, field, value) => {
        try {
            const updatedUser = { ...users.find(user => user._id === id), [field]: value };
            setUsers(users.map(user => (user._id === id ? updatedUser : user)));

            await authAxios().put(`/api/subscribers/${id}`, { [field]: value });
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    // Handle Delete User
    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await authAxios().delete(`/api/subscribers/${id}`);
            setUsers(users.filter(user => user._id !== id));
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    // Drag and Drop Upload (presigned URL flow via Supabase Storage)
    const onDrop = useCallback(async (acceptedFiles) => {
        setUploading(true);

        try {
            const api = authAxios();
            for (const file of acceptedFiles) {
                // 1. Get presigned upload URL
                const { data } = await api.post("/api/upload", {
                    filename: file.name,
                    contentType: file.type,
                });

                // 2. Upload directly to Supabase Storage
                await fetch(data.presignedUrl, {
                    method: "PUT",
                    body: file,
                    headers: { "Content-Type": file.type },
                });

                // 3. Confirm upload and save metadata
                await api.post("/api/upload-confirm", {
                    fileUrl: data.fileUrl,
                });
            }

            await fetchImages();
        } catch (error) {
            console.error("Error uploading images:", error);
        } finally {
            setUploading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: "image/*", multiple: true });

    if (authLoading) {
        return (
            <>
                <div className="page-content">
                    <p>Loading...</p>
                </div>
                <NavBar />
            </>
        );
    }

    if (!session) {
        return (
            <>
                <div className="page-content">
                    <div className="login-form">
                        <h1>Admin Login</h1>
                        <form onSubmit={handleLogin}>
                            <input
                                type="email"
                                placeholder="email"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                required
                            />
                            <input
                                type="password"
                                placeholder="password"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                required
                            />
                            <button type="submit">log in</button>
                            {loginError && <p className="login-error">{loginError}</p>}
                        </form>
                    </div>
                </div>
                <NavBar />
            </>
        );
    }

    return (
        <>
            <div className="page-content">
                <div className="admin-header">
                    <h1>Admin Panel</h1>
                    <button onClick={handleLogout} className="logout-button">log out</button>
                </div>

                <div className="admin-nav">
                    <button onClick={() => setView("images")} className={view === "images" ? "active" : ""}>Manage Images</button>
                    <button onClick={() => setView("users")} className={view === "users" ? "active" : ""}>Manage Users</button>
                </div>

                {view === "images" && (
                    <>
                        <div {...getRootProps()} className="dropzone">
                            <input {...getInputProps()} />
                            <p>{isDragActive ? "Drop the files here..." : "Drag & Drop images or click to upload"}</p>
                        </div>

                        {uploading && <p>Uploading...</p>}

                        <h2>Uploaded Images</h2>

                        {images.length === 0 ? (
                            <p>No images uploaded yet.</p>
                        ) : (
                            <div className="scrollable-table-container">
                                <table className="image-table">
                                    <thead>
                                        <tr>
                                            <th>Preview</th>
                                            <th>Title</th>
                                            <th>Description</th>
                                            <th>Notes</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {images.map((image) => (
                                            <tr key={image._id}>
                                                <td><img src={image.url} alt="preview" className="thumbnail" /></td>
                                                <td><input type="text" value={image.title} onChange={(e) => handleUpdateImage(image._id, "title", e.target.value)} /></td>
                                                <td><input type="text" value={image.description} onChange={(e) => handleUpdateImage(image._id, "description", e.target.value)} /></td>
                                                <td><input type="text" value={image.notes} onChange={(e) => handleUpdateImage(image._id, "notes", e.target.value)} /></td>
                                                <td><button onClick={() => handleDeleteImage(image._id)} className="delete-button">Delete</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                {view === "users" && (
                    <>
                        <h2>Subscribed Users</h2>
                        <table className="user-table">
                            <thead>
                                <tr>
                                    <th>Email</th>
                                    <th>First Name</th>
                                    <th>Last Name</th>
                                    <th>Phone</th>
                                    <th>Subscribed</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user._id}>
                                        <td>{user.email}</td>
                                        <td><input type="text" value={user.firstName} onChange={(e) => handleUpdateUser(user._id, "firstName", e.target.value)} /></td>
                                        <td><input type="text" value={user.lastName} onChange={(e) => handleUpdateUser(user._id, "lastName", e.target.value)} /></td>
                                        <td><input type="text" value={user.phone} onChange={(e) => handleUpdateUser(user._id, "phone", e.target.value)} /></td>
                                        <td>{user.subscribed ? "Yes" : "No"}</td>
                                        <td><button onClick={() => handleDeleteUser(user._id)} className="delete-button">Delete</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}
            </div>
            <NavBar />
        </>
    );
}

export default Admin;

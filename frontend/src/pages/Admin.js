import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import NavBar from "../components/NavBar";
import "../App.css";

function Admin() {
    const [images, setImages] = useState([]);
    const [users, setUsers] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");
    const [view, setView] = useState("images");

    useEffect(() => {
        fetchImages();
        fetchUsers();
    }, []);

    // Fetch images
    const fetchImages = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/images");
            setImages(response.data);
        } catch (error) {
            console.error("Error fetching images:", error);
        }
    };

    // Fetch users
    const fetchUsers = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/subscribers");
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

            await axios.put(`http://localhost:5000/api/images/${id}`, { [field]: value });
        } catch (error) {
            console.error("Error updating image:", error);
        }
    };

    // Handle Delete Image
    const handleDeleteImage = async (id) => {
        if (!window.confirm("Are you sure you want to delete this image?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/images/${id}`);
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

            await axios.put(`http://localhost:5000/api/subscribers/${id}`, { [field]: value });
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    // Handle Delete User
    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/subscribers/${id}`);
            setUsers(users.filter(user => user._id !== id));
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    // Drag and Drop Upload
    const onDrop = useCallback(async (acceptedFiles) => {
        setUploading(true);
        setMessage("Uploading images...");

        const formData = new FormData();
        acceptedFiles.forEach((file) => {
            formData.append("images", file);
        });

        try {
            const response = await axios.post("http://localhost:5000/api/upload-multiple", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            setMessage(response.data.message);
            await fetchImages();
        } catch (error) {
            console.error("Error uploading images:", error);
            setMessage("Failed to upload images.");
        } finally {
            setUploading(false);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: "image/*", multiple: true });

    return (
        <>
            <div className="page-content">
                <h1>Admin Panel</h1>

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

// import { useState } from "react";
// import axios from "axios";

// export default function Search() {
//     const [query, setQuery] = useState("");
//     const [results, setResults] = useState(null);

//     const search = async () => {
//         const res = await axios.get(
//             `http://localhost:5000/api/search?q=${query}`,
//             { withCredentials: true }
//         );

//         setResults(res.data);
//     };

//     return (
//         <div style={{ padding: 20, background: "#020810", color: "#39ff64" }}>
//             <h2>Global Search</h2>

//             <input
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 placeholder="Search..."
//             />

//             <button onClick={search}>Search</button>

//             {results && (
//                 <div>
//                     <h3>Posts</h3>
//                     {results.posts?.map(p => (
//                         <div key={p._id}>{p.title}</div>
//                     ))}

//                     <h3>Users</h3>
//                     {results.users?.map(u => (
//                         <div key={u._id}>{u.username}</div>
//                     ))}

//                     <h3>Communities</h3>
//                     {results.communities?.map(c => (
//                         <div key={c._id}>{c.name}</div>
//                     ))}

//                     <h3>Notices</h3>
//                     {results.notices?.map(n => (
//                         <div key={n._id}>{n.title}</div>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// }
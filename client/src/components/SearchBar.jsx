// import { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { searchAPI } from "../utils/search";

// export default function SearchBar() {
//     const [query, setQuery] = useState("");
//     const [results, setResults] = useState(null);
//     const [open, setOpen] = useState(false);

//     const ref = useRef();
//     const navigate = useNavigate();

//     useEffect(() => {
//         if (!query.trim()) {
//             setResults(null);
//             return;
//         }

//         const timer = setTimeout(async () => {
//             try {
//                 const res = await searchAPI(query);
//                 setResults(res.data);
//                 setOpen(true);
//             } catch (err) {
//                 console.error(err);
//             }
//         }, 300);

//         return () => clearTimeout(timer);
//     }, [query]);

//     useEffect(() => {
//         const handleClick = (e) => {
//             if (ref.current && !ref.current.contains(e.target)) {
//                 setOpen(false);
//             }
//         };
//         document.addEventListener("mousedown", handleClick);
//         return () => document.removeEventListener("mousedown", handleClick);
//     }, []);

//     const go = (path) => {
//         setOpen(false);
//         setQuery("");
//         navigate(path);
//     };

//     return (
//         <div ref={ref} className="relative w-full max-w-md">

//             <input
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 onFocus={() => setOpen(true)}
//                 placeholder="Search..."
//                 className="w-full p-2 border"
//             />

//             {open && results && (
//                 <div className="absolute w-full bg-black text-white z-50">

//                     {results.posts?.map(p => (
//                         <div key={p._id} onClick={() => go(`/post/${p._id}`)}>
//                             {p.title}
//                         </div>
//                     ))}

//                     {results.users?.map(u => (
//                         <div key={u._id} onClick={() => go(`/profile/${u._id}`)}>
//                             {u.name}
//                         </div>
//                     ))}

//                     {results.communities?.map(c => (
//                         <div key={c._id} onClick={() => go(`/community/${c.slug}`)}>
//                             {c.name}
//                         </div>
//                     ))}

//                 </div>
//             )}
//         </div>
//     );
// }
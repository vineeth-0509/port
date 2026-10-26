import { useState } from "react";
import { getProjects, saveProjects, verify } from "./api.js";

const blank = () => ({ id: "p" + Date.now(), t: "", g: "", d: "", tech: [], l: "", y: "", i: "✨", img: "", h: Math.floor(Math.random() * 360) });

export default function Admin() {
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [list, setList] = useState([]);
  const [f, setF] = useState(null);     // project being edited
  const [fi, setFi] = useState(null);   // its index (null = new)
  const [techText, setTechText] = useState("");
  const [msg, setMsg] = useState({ t: "", e: false });
  const say = (t, e = false) => setMsg({ t, e });

  const login = async () => {
    try {
      await verify(pw);
      setList(await getProjects());
      setAuthed(true);
      say("");
    } catch (e) { say(e.message, true); }
  };
  const dirty = () => say("Unsaved changes — press “Save & publish”.");
  const open = (i) => {
    const p = i == null ? blank() : { ...list[i] };
    setF(p); setFi(i); setTechText((p.tech || []).join(", "));
  };
  const apply = () => {
    if (!f.t.trim()) return say("Project name is required.", true);
    const p = { ...f, tech: techText.split(",").map((s) => s.trim()).filter(Boolean) };
    setList(fi == null ? [p, ...list] : list.map((x, i) => (i === fi ? p : x)));
    setF(null); dirty();
  };
  const move = (i, d) => {
    const j = i + d; if (j < 0 || j >= list.length) return;
    const n = [...list]; [n[i], n[j]] = [n[j], n[i]]; setList(n); dirty();
  };
  const del = (i) => { if (confirm(`Delete “${list[i].t}”?`)) { setList(list.filter((_, k) => k !== i)); dirty(); } };
  const save = async () => {
    try { say("Saving…"); await saveProjects(list, pw); say("Saved! Your live portfolio is updated."); }
    catch (e) { say(e.message, true); }
  };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  if (!authed)
    return (
      <div className="adm" style={{ padding: "12vh 5vw" }}>
        <h1>Portfolio admin</h1>
        <p style={{ color: "var(--mut)" }}>Only the owner can save changes. The password is checked on the server.</p>
        <input type="password" placeholder="Admin password" value={pw} autoFocus
          onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()} />
        <button onClick={login}>Log in</button>
        <div className={"msg" + (msg.e ? " e" : "")}>{msg.t}</div>
        <a href="/" style={{ color: "var(--mut)" }}>← Back to portfolio</a>
      </div>
    );

  return (
    <div className="adm" style={{ padding: "60px 5vw" }}>
      <h1>Manage projects</h1>
      <p style={{ color: "var(--mut)" }}>Add, edit, reorder or delete — then press Save &amp; publish.</p>
      <button onClick={() => open(null)}>＋ Add project</button>
      <button onClick={save}>Save &amp; publish</button>
      <a href="/" style={{ color: "var(--mut)", marginLeft: 8 }}>View site ↗</a>
      <div className={"msg" + (msg.e ? " e" : "")}>{msg.t}</div>

      {f && (
        <div className="fm">
          <h3>{fi == null ? "New project" : "Edit project"}</h3>
          <label>Project name</label><input value={f.t} onChange={set("t")} />
          <label>One-line tagline</label><input value={f.g} onChange={set("g")} />
          <label>What it is and what it does</label><textarea rows={6} value={f.d} onChange={set("d")} />
          <label>Tech stack (comma separated)</label><input value={techText} onChange={(e) => setTechText(e.target.value)} />
          <label>Official / live link (https://…)</label><input value={f.l} onChange={set("l")} />
          <label>Screenshot image URL (optional)</label><input value={f.img || ""} onChange={set("img")} />
          <label>Year</label><input value={f.y} onChange={set("y")} />
          <label>Emoji icon</label><input value={f.i} onChange={set("i")} />
          <label>Accent color</label>
          <input type="range" min="0" max="359" value={f.h} onChange={(e) => setF({ ...f, h: +e.target.value })} />
          <button onClick={apply}>Apply</button><button className="g" onClick={() => setF(null)}>Cancel</button>
        </div>
      )}

      {list.map((p, i) => (
        <div className="it" key={p.id}>
          <span>{p.i} {p.t}</span>
          <span>
            <button className="g" onClick={() => move(i, -1)}>↑</button>
            <button className="g" onClick={() => move(i, 1)}>↓</button>
            <button className="g" onClick={() => open(i)}>Edit</button>
            <button className="d" onClick={() => del(i)}>Delete</button>
          </span>
        </div>
      ))}
    </div>
  );
}

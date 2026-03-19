'use client';
export default function IDEShell({ projectId }: { projectId: string }) {
  return (
    <div style={{ width:'100vw', height:'100dvh', background:'#0a0a10', 
                  color:'#f0f0f8', display:'flex', alignItems:'center', 
                  justifyContent:'center', fontFamily:'sans-serif' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:32, fontWeight:700, color:'#7c6fff' }}>P</div>
        <div style={{ fontSize:14, marginTop:8, color:'#9898b8' }}>
          Polyglot OS — Project: {projectId}
        </div>
        <div style={{ fontSize:11, marginTop:4, color:'#4a4a68' }}>
          IDE Shell loading...
        </div>
      </div>
    </div>
  );
}

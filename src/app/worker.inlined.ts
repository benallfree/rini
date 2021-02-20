export default '(()=>{var Z=Object.create,D=Object.defineProperty,j=Object.getPrototypeOf,ee=Object.prototype.hasOwnProperty,te=Object.getOwnPropertyNames,se=Object.getOwnPropertyDescriptor;var re=e=>D(e,"__esModule",{value:!0});var oe=(e,t)=>()=>(t||(t={exports:{}},e(t.exports,t)),t.exports);var ne=(e,t,r)=>{if(t&&typeof t=="object"||typeof t=="function")for(let o of te(t))!ee.call(e,o)&&o!=="default"&&D(e,o,{get:()=>t[o],enumerable:!(r=se(t,o))||r.enumerable});return e},ae=e=>e&&e.__esModule?e:ne(re(D(e!=null?Z(j(e)):{},"default",{value:e,enumerable:!0})),e);var H=oe((ce,R)=>{var l=null;typeof WebSocket!="undefined"?l=WebSocket:typeof MozWebSocket!="undefined"?l=MozWebSocket:typeof global!="undefined"?l=global.WebSocket||global.MozWebSocket:typeof window!="undefined"?l=window.WebSocket||window.MozWebSocket:typeof self!="undefined"&&(l=self.WebSocket||self.MozWebSocket);R.exports=l});var $=ae(H());var L=()=>({events:{},emit(e,...t){(this.events[e]||[]).forEach(r=>r(...t))},on(e,t){return(this.events[e]=this.events[e]||[]).push(t),()=>this.events[e]=(this.events[e]||[]).filter(r=>r!==t)}});function u(){let e=L();return[t=>e.on("callem",t),t=>{e.emit("callem",t)}]}var A=e=>{let t=0;return{pack:(g,b,i=0)=>{let y={id:t++,refId:i,type:g,message:b};return[JSON.stringify(y),y]},unpack:g=>(()=>{try{let i=JSON.parse(g);if(!("id"in i))throw new Error(`Invalid parsed packet format ${JSON.stringify(i)} (${g})`);return i}catch(i){throw new Error(`Parse failed for ${g}, ${i}`)}})()}};var U=()=>A();var m;(function(e){e[e.Login=1]="Login",e[e.Session=2]="Session",e[e.NearbyEntities=3]="NearbyEntities",e[e.PositionUpdate=4]="PositionUpdate"})(m||(m={}));var M=U();var q=e=>{let t=0,r=!1,o={idToken:"",host:"192.168.1.2",port:3e3,maxRetries:0,retryDelayMs:5e3,awaitReplyTimeoutMs:1e3,...e,logger:{info:console.log,warn:console.warn,error:console.error,debug:console.log,...e?.logger}},{idToken:g,host:b,port:i,maxRetries:y,retryDelayMs:k,awaitReplyTimeoutMs:z,logger:n}=o,[E,_]=u(),[I,O]=u(),[J,F]=u(),d,S=()=>{T=void 0;let s=$.default||$;console.log({Ws:s}),d=new s(`ws://${b}:${i}`),d.onmessage=p=>{let{data:c}=p;if(typeof c!="string")throw new Error(`Unsupported data type ${c}`);let C=M.unpack(c);_(C)},d.onopen=()=>{t=0,n.debug("connected"),n.debug("listening for data"),g&&P({idToken:g}).then(()=>{r=!0,O({attempt:t})}).catch(p=>{n.error("Error logging in",p),a(),x()})},d.onclose=()=>{n.debug("close"),a(),x()},d.onerror=p=>{n.error(p),a(),x()};let a=()=>{n.debug("Cleaning up"),d.close(),r=!1,F({attempt:t})}},T,x=()=>{if(!T){if(n.debug("scheduling reconnect"),y&&t>=y){n.debug("Max retries exceeded");return}t++,T=setTimeout(()=>{n.debug("attempting reconnect now"),S()},k)}};S();let G=async(s,a)=>{let[p,c]=M.pack(s,a);return n.debug({certified:c}),new Promise((C,W)=>{let v=setTimeout(()=>{w(),W(`Timed out awaiting reply to ${c.id}`)},z),w=E(h=>{h.refId===c.id&&(w(),clearTimeout(v),C(h))});N(p).catch(h=>{w(),clearTimeout(v),W("Error sending. Trigger reconnect")})})},K=(s,a)=>{let[p]=M.pack(s,a);N(p).catch(c=>{n.error("Error sending message",c)})},P=s=>G(m.Login,s),Q=async s=>{K(m.PositionUpdate,s)},N=async s=>d.send(s),[V,X]=u(),Y={[m.NearbyEntities]:X};return E(s=>{let a=Y[s.type];!a||a(s.message)}),{close:()=>d.close(),login:P,updatePosition:Q,onConnect:I,onDisconnect:J,isConnected:()=>r,onNearbyEntities:V}};var{log:f}=window,B=()=>{window.send({type:"heartbeat"}),setTimeout(B,500)};B();window.onMessage(e=>{let t=e,o={}[t.type];if(!o)throw new Error(`Message type ${t.type} is not implemented`);o(t),f("Rx main->worker",{_msg:t})});var ze=q({logger:{info:f,debug:f,error:f,warn:f}});window.ready();})();\n//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibm9kZV9tb2R1bGVzL2lzb21vcnBoaWMtd3MvYnJvd3Nlci5qcyIsICJzcmMvY2xpZW50L2NyZWF0ZUNsaWVudE5ldGNvZGUudHMiLCAibm9kZV9tb2R1bGVzL25hbm9ldmVudHMvaW5kZXguanMiLCAic3JjL2NhbGxlbS9pbmRleC50cyIsICJzcmMvbjUzL3RyYW5zcG9ydC50cyIsICJzcmMvbjUzL2luZGV4LnRzIiwgInNyYy9jb21tb24vaW5kZXgudHMiLCAic3JjL2FwcC93b3JrZXIudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXhvZ2Rlbi93ZWJzb2NrZXQtc3RyZWFtL2Jsb2IvNDhkYzNkZGY5NDNlNWFkYTY2OGMzMWNjZDk0ZTkxODZmMDJmYWZiZC93cy1mYWxsYmFjay5qc1xuXG52YXIgd3MgPSBudWxsXG5cbmlmICh0eXBlb2YgV2ViU29ja2V0ICE9PSAndW5kZWZpbmVkJykge1xuICB3cyA9IFdlYlNvY2tldFxufSBlbHNlIGlmICh0eXBlb2YgTW96V2ViU29ja2V0ICE9PSAndW5kZWZpbmVkJykge1xuICB3cyA9IE1veldlYlNvY2tldFxufSBlbHNlIGlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykge1xuICB3cyA9IGdsb2JhbC5XZWJTb2NrZXQgfHwgZ2xvYmFsLk1veldlYlNvY2tldFxufSBlbHNlIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICB3cyA9IHdpbmRvdy5XZWJTb2NrZXQgfHwgd2luZG93Lk1veldlYlNvY2tldFxufSBlbHNlIGlmICh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgd3MgPSBzZWxmLldlYlNvY2tldCB8fCBzZWxmLk1veldlYlNvY2tldFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHdzXG4iLCAiaW1wb3J0ICogYXMgV2ViU29ja2V0IGZyb20gJ2lzb21vcnBoaWMtd3MnXG5pbXBvcnQgeyBjYWxsZW0sIENhbGxlbUVtaXR0ZXIsIENhbGxlbVN1YnNjcmliZXIgfSBmcm9tICcuLi9jYWxsZW0nXG5pbXBvcnQge1xuICBBbnlNZXNzYWdlLFxuICBMb2dpblJlcXVlc3QsXG4gIE1lc3NhZ2VUeXBlcyxcbiAgTmVhcmJ5RW50aXRpZXMsXG4gIG5ldGNvZGUsXG4gIFBvc2l0aW9uVXBkYXRlLFxufSBmcm9tICcuLi9jb21tb24nXG5pbXBvcnQgeyBNZXNzYWdlV3JhcHBlciB9IGZyb20gJy4uL241MydcblxuZXhwb3J0IHR5cGUgQ2xpZW50TWVzc2FnZVNlbmRlciA9IChtc2c6IEJ1ZmZlcikgPT4gUHJvbWlzZTx2b2lkPlxuXG5leHBvcnQgaW50ZXJmYWNlIExvZ2dlciB7XG4gIGluZm8oLi4uYXJnczogYW55W10pOiB2b2lkXG4gIHdhcm4oLi4uYXJnczogYW55W10pOiB2b2lkXG4gIGRlYnVnKC4uLmFyZ3M6IGFueVtdKTogdm9pZFxuICBlcnJvciguLi5hcmdzOiBhbnlbXSk6IHZvaWRcbn1cblxuZXhwb3J0IHR5cGUgQ2xpZW50TmV0Y29kZUNvbmZpZyA9IHtcbiAgaWRUb2tlbjogc3RyaW5nXG4gIGhvc3Q6IHN0cmluZ1xuICBwb3J0OiBudW1iZXJcbiAgbWF4UmV0cmllczogbnVtYmVyXG4gIHJldHJ5RGVsYXlNczogbnVtYmVyXG4gIGF3YWl0UmVwbHlUaW1lb3V0TXM6IG51bWJlclxuICBsb2dnZXI6IExvZ2dlclxufVxuXG5leHBvcnQgdHlwZSBDb25uZWN0RXZlbnQgPSB7IGF0dGVtcHQ6IG51bWJlciB9XG5leHBvcnQgdHlwZSBEaXNjb25uZWN0RXZlbnQgPSB7IGF0dGVtcHQ6IG51bWJlciB9XG5cbmV4cG9ydCB0eXBlIFNvY2tldENvbm5lY3Rpb24gPSB7XG4gIG9uT3BlbjogQ2FsbGVtU3Vic2NyaWJlclxuICBvbkRhdGE6IENhbGxlbVN1YnNjcmliZXI8eyBidWZmZXI6IEJ1ZmZlciB9PlxuICBvbkVycm9yOiBDYWxsZW1TdWJzY3JpYmVyPHsgZXJyb3I6IEVycm9yIH0+XG4gIG9uQ2xvc2U6IENhbGxlbVN1YnNjcmliZXJcbiAgZGVzdHJveTogKCkgPT4gdm9pZFxuICB3cml0ZTogKGJ1ZmZlcjogQnVmZmVyKSA9PiBQcm9taXNlPHZvaWQ+XG59XG5cbmV4cG9ydCBjb25zdCBjcmVhdGVDbGllbnROZXRjb2RlID0gKFxuICBzZXR0aW5ncz86IFBhcnRpYWw8Q2xpZW50TmV0Y29kZUNvbmZpZz5cbikgPT4ge1xuICBsZXQgcmV0cnlDb3VudCA9IDBcbiAgbGV0IGlzQ29ubmVjdGVkID0gZmFsc2VcblxuICBjb25zdCBfc2V0dGluZ3M6IENsaWVudE5ldGNvZGVDb25maWcgPSB7XG4gICAgaWRUb2tlbjogJycsXG4gICAgaG9zdDogJzE5Mi4xNjguMS4yJyxcbiAgICBwb3J0OiAzMDAwLFxuICAgIG1heFJldHJpZXM6IDAsXG4gICAgcmV0cnlEZWxheU1zOiA1MDAwLFxuICAgIGF3YWl0UmVwbHlUaW1lb3V0TXM6IDEwMDAsXG4gICAgLi4uc2V0dGluZ3MsXG4gICAgbG9nZ2VyOiB7XG4gICAgICBpbmZvOiBjb25zb2xlLmxvZyxcbiAgICAgIHdhcm46IGNvbnNvbGUud2FybixcbiAgICAgIGVycm9yOiBjb25zb2xlLmVycm9yLFxuICAgICAgZGVidWc6IGNvbnNvbGUubG9nLFxuICAgICAgLi4uc2V0dGluZ3M/LmxvZ2dlcixcbiAgICB9LFxuICB9XG4gIGNvbnN0IHtcbiAgICBpZFRva2VuLFxuICAgIGhvc3QsXG4gICAgcG9ydCxcbiAgICBtYXhSZXRyaWVzLFxuICAgIHJldHJ5RGVsYXlNcyxcbiAgICBhd2FpdFJlcGx5VGltZW91dE1zLFxuICAgIGxvZ2dlcixcbiAgfSA9IF9zZXR0aW5nc1xuXG4gIGNvbnN0IFtvbk1lc3NhZ2UsIGVtaXRNZXNzYWdlXSA9IGNhbGxlbTxNZXNzYWdlV3JhcHBlcj4oKVxuICBjb25zdCBbb25Db25uZWN0LCBlbWl0Q29ubmVjdF0gPSBjYWxsZW08Q29ubmVjdEV2ZW50PigpXG4gIGNvbnN0IFtvbkRpc2Nvbm5lY3QsIGVtaXREaXNjb25uZWN0XSA9IGNhbGxlbTxEaXNjb25uZWN0RXZlbnQ+KClcblxuICBsZXQgY29ubjogV2ViU29ja2V0XG4gIGNvbnN0IGNvbm5lY3QgPSAoKSA9PiB7XG4gICAgcmV0cnlUaWQgPSB1bmRlZmluZWRcbiAgICAvL0B0cy1pZ25vcmVcbiAgICBjb25zdCBXcyA9IFdlYlNvY2tldC5kZWZhdWx0IHx8IFdlYlNvY2tldFxuICAgIGNvbnNvbGUubG9nKHsgV3MgfSlcbiAgICAvL0B0cy1pZ25vcmVcbiAgICBjb25uID0gbmV3IFdzKGB3czovLyR7aG9zdH06JHtwb3J0fWApXG4gICAgY29ubi5vbm1lc3NhZ2UgPSAoZSkgPT4ge1xuICAgICAgY29uc3QgeyBkYXRhIH0gPSBlXG4gICAgICBpZiAodHlwZW9mIGRhdGEgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgZGF0YSB0eXBlICR7ZGF0YX1gKVxuICAgICAgfVxuICAgICAgY29uc3QgbXNnID0gbmV0Y29kZS51bnBhY2soZGF0YSlcbiAgICAgIGVtaXRNZXNzYWdlKG1zZylcbiAgICB9XG5cbiAgICBjb25uLm9ub3BlbiA9ICgpID0+IHtcbiAgICAgIHJldHJ5Q291bnQgPSAwXG4gICAgICBsb2dnZXIuZGVidWcoJ2Nvbm5lY3RlZCcpXG4gICAgICBsb2dnZXIuZGVidWcoJ2xpc3RlbmluZyBmb3IgZGF0YScpXG5cbiAgICAgIGlmIChpZFRva2VuKSB7XG4gICAgICAgIGxvZ2luKHsgaWRUb2tlbiB9KVxuICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIGlzQ29ubmVjdGVkID0gdHJ1ZVxuICAgICAgICAgICAgZW1pdENvbm5lY3Qoe1xuICAgICAgICAgICAgICBhdHRlbXB0OiByZXRyeUNvdW50LFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jYXRjaCgoZSkgPT4ge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGBFcnJvciBsb2dnaW5nIGluYCwgZSlcbiAgICAgICAgICAgIGNsZWFudXAoKVxuICAgICAgICAgICAgcmVjb25uZWN0KClcbiAgICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbm4ub25jbG9zZSA9ICgpID0+IHtcbiAgICAgIGxvZ2dlci5kZWJ1ZygnY2xvc2UnKVxuICAgICAgY2xlYW51cCgpXG4gICAgICByZWNvbm5lY3QoKVxuICAgIH1cblxuICAgIGNvbm4ub25lcnJvciA9IChlKSA9PiB7XG4gICAgICBsb2dnZXIuZXJyb3IoZSlcbiAgICAgIGNsZWFudXAoKVxuICAgICAgcmVjb25uZWN0KClcbiAgICB9XG5cbiAgICBjb25zdCBjbGVhbnVwID0gKCkgPT4ge1xuICAgICAgbG9nZ2VyLmRlYnVnKCdDbGVhbmluZyB1cCcpXG4gICAgICBjb25uLmNsb3NlKClcbiAgICAgIGlzQ29ubmVjdGVkID0gZmFsc2VcbiAgICAgIGVtaXREaXNjb25uZWN0KHtcbiAgICAgICAgYXR0ZW1wdDogcmV0cnlDb3VudCxcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgbGV0IHJldHJ5VGlkOiBSZXR1cm5UeXBlPHR5cGVvZiBzZXRUaW1lb3V0PiB8IHVuZGVmaW5lZFxuXG4gIGNvbnN0IHJlY29ubmVjdCA9ICgpID0+IHtcbiAgICBpZiAocmV0cnlUaWQpIHJldHVyblxuICAgIGxvZ2dlci5kZWJ1Zygnc2NoZWR1bGluZyByZWNvbm5lY3QnKVxuICAgIGlmIChtYXhSZXRyaWVzICYmIHJldHJ5Q291bnQgPj0gbWF4UmV0cmllcykge1xuICAgICAgbG9nZ2VyLmRlYnVnKGBNYXggcmV0cmllcyBleGNlZWRlZGApXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgcmV0cnlDb3VudCsrXG4gICAgcmV0cnlUaWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGxvZ2dlci5kZWJ1ZygnYXR0ZW1wdGluZyByZWNvbm5lY3Qgbm93JylcbiAgICAgIGNvbm5lY3QoKVxuICAgIH0sIHJldHJ5RGVsYXlNcylcbiAgfVxuXG4gIGNvbm5lY3QoKVxuXG4gIGNvbnN0IHNlbmRNZXNzYWdlQW5kQXdhaXRSZXBseSA9IGFzeW5jIDxcbiAgICBUTWVzc2FnZSBleHRlbmRzIEFueU1lc3NhZ2UsXG4gICAgVFJlcGx5IGV4dGVuZHMgQW55TWVzc2FnZVxuICA+KFxuICAgIHR5cGU6IE1lc3NhZ2VUeXBlcyxcbiAgICBtc2c6IFRNZXNzYWdlXG4gICk6IFByb21pc2U8VFJlcGx5PiA9PiB7XG4gICAgY29uc3QgW3BhY2tlZCwgY2VydGlmaWVkXSA9IG5ldGNvZGUucGFjayh0eXBlLCBtc2cpXG4gICAgbG9nZ2VyLmRlYnVnKHsgY2VydGlmaWVkIH0pXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPFRSZXBseT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgdGlkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHVuc3ViKClcbiAgICAgICAgcmVqZWN0KGBUaW1lZCBvdXQgYXdhaXRpbmcgcmVwbHkgdG8gJHtjZXJ0aWZpZWQuaWR9YClcbiAgICAgIH0sIGF3YWl0UmVwbHlUaW1lb3V0TXMpXG4gICAgICBjb25zdCB1bnN1YiA9IG9uTWVzc2FnZSgobSkgPT4ge1xuICAgICAgICBpZiAobS5yZWZJZCAhPT0gY2VydGlmaWVkLmlkKSByZXR1cm4gLy8gU2tpcCwgaXQncyBub3Qgb3VyIG1lc3NhZ2VcbiAgICAgICAgdW5zdWIoKVxuICAgICAgICBjbGVhclRpbWVvdXQodGlkKVxuICAgICAgICByZXNvbHZlKChtIGFzIHVua25vd24pIGFzIFRSZXBseSlcbiAgICAgIH0pXG4gICAgICBzZW5kKHBhY2tlZCkuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgdW5zdWIoKVxuICAgICAgICBjbGVhclRpbWVvdXQodGlkKVxuICAgICAgICByZWplY3QoYEVycm9yIHNlbmRpbmcuIFRyaWdnZXIgcmVjb25uZWN0YClcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IHNlbmRNZXNzYWdlID0gPFRNZXNzYWdlIGV4dGVuZHMgQW55TWVzc2FnZT4oXG4gICAgdHlwZTogTWVzc2FnZVR5cGVzLFxuICAgIG1zZzogVE1lc3NhZ2VcbiAgKTogdm9pZCA9PiB7XG4gICAgY29uc3QgW3BhY2tlZF0gPSBuZXRjb2RlLnBhY2sodHlwZSwgbXNnKVxuICAgIHNlbmQocGFja2VkKS5jYXRjaCgoZSkgPT4ge1xuICAgICAgbG9nZ2VyLmVycm9yKGBFcnJvciBzZW5kaW5nIG1lc3NhZ2VgLCBlKVxuICAgIH0pXG4gIH1cblxuICBjb25zdCBsb2dpbiA9IChtZXNzYWdlOiBMb2dpblJlcXVlc3QpID0+XG4gICAgc2VuZE1lc3NhZ2VBbmRBd2FpdFJlcGx5KE1lc3NhZ2VUeXBlcy5Mb2dpbiwgbWVzc2FnZSlcblxuICBjb25zdCB1cGRhdGVQb3NpdGlvbiA9IGFzeW5jIChtZXNzYWdlOiBQb3NpdGlvblVwZGF0ZSkgPT4ge1xuICAgIHNlbmRNZXNzYWdlKE1lc3NhZ2VUeXBlcy5Qb3NpdGlvblVwZGF0ZSwgbWVzc2FnZSlcbiAgfVxuXG4gIGNvbnN0IHNlbmQgPSBhc3luYyAoZGF0YTogc3RyaW5nKSA9PiBjb25uLnNlbmQoZGF0YSlcblxuICAvLyBMaXN0ZW4gZm9yIGltcG9ydGFudCBtZXNzYWdlc1xuICBjb25zdCBbb25OZWFyYnlFbnRpdGllcywgZW1pdE5lYXJieUVudGl0aWVzXSA9IGNhbGxlbTxOZWFyYnlFbnRpdGllcz4oKVxuICBjb25zdCBkaXNwYXRjaEhhbmRsZXJzOiB7IFtfIGluIE1lc3NhZ2VUeXBlc10/OiBDYWxsZW1FbWl0dGVyPGFueT4gfSA9IHtcbiAgICBbTWVzc2FnZVR5cGVzLk5lYXJieUVudGl0aWVzXTogZW1pdE5lYXJieUVudGl0aWVzLFxuICB9XG4gIG9uTWVzc2FnZSgobSkgPT4ge1xuICAgIC8vIGxvZ2dlci5sb2coYGdvdCByYXcgbWVzc2FnZSBpbmNvbWluZ2AsIG0pXG4gICAgY29uc3QgZGlzcGF0Y2hIYW5kbGVyID0gZGlzcGF0Y2hIYW5kbGVyc1ttLnR5cGUgYXMgTWVzc2FnZVR5cGVzXVxuICAgIGlmICghZGlzcGF0Y2hIYW5kbGVyKSByZXR1cm4gLy8gTm90IGhhbmRsZWRcbiAgICBkaXNwYXRjaEhhbmRsZXIobS5tZXNzYWdlKVxuICB9KVxuXG4gIGNvbnN0IGFwaSA9IHtcbiAgICBjbG9zZTogKCkgPT4gY29ubi5jbG9zZSgpLFxuICAgIGxvZ2luLFxuICAgIHVwZGF0ZVBvc2l0aW9uLFxuICAgIG9uQ29ubmVjdCxcbiAgICBvbkRpc2Nvbm5lY3QsXG4gICAgaXNDb25uZWN0ZWQ6ICgpID0+IGlzQ29ubmVjdGVkLFxuICAgIG9uTmVhcmJ5RW50aXRpZXMsXG4gIH1cbiAgcmV0dXJuIGFwaVxufVxuXG5leHBvcnQgdHlwZSBDbGllbnROZXRjb2RlID0gUmV0dXJuVHlwZTx0eXBlb2YgY3JlYXRlQ2xpZW50TmV0Y29kZT5cbiIsICJsZXQgY3JlYXRlTmFub0V2ZW50cyA9ICgpID0+ICh7XG4gIGV2ZW50czoge30sXG4gIGVtaXQgKGV2ZW50LCAuLi5hcmdzKSB7XG4gICAgOyh0aGlzLmV2ZW50c1tldmVudF0gfHwgW10pLmZvckVhY2goaSA9PiBpKC4uLmFyZ3MpKVxuICB9LFxuICBvbiAoZXZlbnQsIGNiKSB7XG4gICAgOyh0aGlzLmV2ZW50c1tldmVudF0gPSB0aGlzLmV2ZW50c1tldmVudF0gfHwgW10pLnB1c2goY2IpXG4gICAgcmV0dXJuICgpID0+XG4gICAgICAodGhpcy5ldmVudHNbZXZlbnRdID0gKHRoaXMuZXZlbnRzW2V2ZW50XSB8fCBbXSkuZmlsdGVyKGkgPT4gaSAhPT0gY2IpKVxuICB9XG59KVxuXG5leHBvcnQgeyBjcmVhdGVOYW5vRXZlbnRzIH1cbiIsICJpbXBvcnQgeyBjcmVhdGVOYW5vRXZlbnRzIH0gZnJvbSAnbmFub2V2ZW50cydcblxuZXhwb3J0IHR5cGUgRGF0YVByaW1pdGl2ZXMgPSBhbnlcbmV4cG9ydCB0eXBlIENhbGxlbURhdGEgPSB7IFtfOiBzdHJpbmddOiBEYXRhUHJpbWl0aXZlcyB9XG5leHBvcnQgdHlwZSBVbnN1YnNjcmliZSA9ICgpID0+IHZvaWRcbmV4cG9ydCB0eXBlIENhbGxlbUhhbmRsZXI8VERhdGEgZXh0ZW5kcyBDYWxsZW1EYXRhID0ge30+ID0gKGRhdGE6IFREYXRhKSA9PiB2b2lkXG5leHBvcnQgdHlwZSBDYWxsZW1TdWJzY3JpYmVyPFREYXRhIGV4dGVuZHMgQ2FsbGVtRGF0YSA9IHt9PiA9IChcbiAgY2I6IENhbGxlbUhhbmRsZXI8VERhdGE+XG4pID0+IFVuc3Vic2NyaWJlXG5leHBvcnQgdHlwZSBDYWxsZW1FbWl0dGVyPFREYXRhIGV4dGVuZHMgQ2FsbGVtRGF0YSA9IHt9PiA9IChkYXRhOiBURGF0YSkgPT4gdm9pZFxuXG5leHBvcnQgdHlwZSBDYWxsZW1QYWlyPFREYXRhIGV4dGVuZHMgQ2FsbGVtRGF0YSA9IHt9PiA9IFtcbiAgQ2FsbGVtU3Vic2NyaWJlcjxURGF0YT4sXG4gIENhbGxlbUVtaXR0ZXI8VERhdGE+XG5dXG5cbi8qXG5Vc2FnZSBleGFtcGxlOlxuXG5jb25zdCBbb24sIGVtaXRdID0gY2FsbGVtPHN0cmluZz4oKVxuXG5jb25zdCB1bnN1YiA9IG9uKCBzPT57XG4gIGNvbnNvbGUubG9nKCdnb3Qgc3RyaW5nJywgcylcbn0pXG5lbWl0KCdoZWxsbycpXG51bnN1YigpIC8vIFVuc3Vic2NyaWJlLCBzdG9wIGxpc3RlbmluZ1xuXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGNhbGxlbTxURGF0YSBleHRlbmRzIENhbGxlbURhdGEgPSB7fT4oKTogQ2FsbGVtUGFpcjxURGF0YT4ge1xuICBjb25zdCBlbWl0dGVyID0gY3JlYXRlTmFub0V2ZW50cygpXG4gIHJldHVybiBbXG4gICAgKGNhbGxiYWNrOiBDYWxsZW1IYW5kbGVyPFREYXRhPik6IFVuc3Vic2NyaWJlID0+IHtcbiAgICAgIGNvbnN0IHVuc3ViID0gZW1pdHRlci5vbignY2FsbGVtJywgY2FsbGJhY2spXG4gICAgICByZXR1cm4gdW5zdWJcbiAgICB9LFxuICAgIChkYXRhOiBURGF0YSkgPT4ge1xuICAgICAgZW1pdHRlci5lbWl0KCdjYWxsZW0nLCBkYXRhKVxuICAgIH0sXG4gIF1cbn1cbiIsICJpbXBvcnQgeyBBbnlNZXNzYWdlLCBNZXNzYWdlVHlwZXMgfSBmcm9tICcuLi9jb21tb24nXG5cbmV4cG9ydCB0eXBlIFRyYW5zcG9ydFBhY2tlckNvbmZpZyA9IHt9XG5cbmV4cG9ydCB0eXBlIE1lc3NhZ2VIZWFkZXIgPSB7XG4gIGlkOiBudW1iZXJcbiAgcmVmSWQ6IG51bWJlclxuICB0eXBlOiBNZXNzYWdlVHlwZXNcbn1cblxuZXhwb3J0IHR5cGUgTWVzc2FnZVdyYXBwZXI8XG4gIFRNZXNzYWdlIGV4dGVuZHMgQW55TWVzc2FnZSA9IEFueU1lc3NhZ2Vcbj4gPSBNZXNzYWdlSGVhZGVyICYge1xuICBtZXNzYWdlOiBUTWVzc2FnZVxufVxuXG5leHBvcnQgY29uc3QgY3JlYXRlVHJhbnNwb3J0UGFja2VyID0gKFxuICBjb25maWc/OiBQYXJ0aWFsPFRyYW5zcG9ydFBhY2tlckNvbmZpZz5cbikgPT4ge1xuICBsZXQgbWVzc2FnZUlkID0gMFxuXG4gIGNvbnN0IHBhY2sgPSA8VE1lc3NhZ2UgZXh0ZW5kcyBBbnlNZXNzYWdlPihcbiAgICB0eXBlOiBNZXNzYWdlVHlwZXMsXG4gICAgbWVzc2FnZTogVE1lc3NhZ2UsXG4gICAgcmVmSWQgPSAwXG4gICk6IFtzdHJpbmcsIE1lc3NhZ2VXcmFwcGVyPFRNZXNzYWdlPl0gPT4ge1xuICAgIHR5cGUgVGhpc01lc3NhZ2VXcmFwcGVyID0gTWVzc2FnZVdyYXBwZXI8VE1lc3NhZ2U+XG5cbiAgICBjb25zdCB3cmFwcGVyOiBUaGlzTWVzc2FnZVdyYXBwZXIgPSB7XG4gICAgICBpZDogbWVzc2FnZUlkKyssXG4gICAgICByZWZJZCxcbiAgICAgIHR5cGU6IHR5cGUgYXMgbnVtYmVyLFxuICAgICAgbWVzc2FnZSxcbiAgICB9XG5cbiAgICBjb25zdCBwYWNrZWQgPSBKU09OLnN0cmluZ2lmeSh3cmFwcGVyKVxuICAgIHJldHVybiBbcGFja2VkLCB3cmFwcGVyXVxuICB9XG5cbiAgY29uc3QgdW5wYWNrID0gPFRNZXNzYWdlIGV4dGVuZHMgQW55TWVzc2FnZT4ocGFja2VkOiBzdHJpbmcpID0+IHtcbiAgICB0eXBlIFRoaXNNZXNzYWdlV3JhcHBlciA9IE1lc3NhZ2VXcmFwcGVyPFRNZXNzYWdlPlxuICAgIGNvbnN0IHdyYXBwZXIgPSAoKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZGF0YSA9IEpTT04ucGFyc2UocGFja2VkKVxuICAgICAgICBpZiAoISgnaWQnIGluIGRhdGEpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYEludmFsaWQgcGFyc2VkIHBhY2tldCBmb3JtYXQgJHtKU09OLnN0cmluZ2lmeShkYXRhKX0gKCR7cGFja2VkfSlgXG4gICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkYXRhIGFzIFRoaXNNZXNzYWdlV3JhcHBlclxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFBhcnNlIGZhaWxlZCBmb3IgJHtwYWNrZWR9LCAke2V9YClcbiAgICAgIH1cbiAgICB9KSgpXG5cbiAgICByZXR1cm4gd3JhcHBlclxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBwYWNrLFxuICAgIHVucGFjayxcbiAgfVxufVxuIiwgImltcG9ydCB7IGNyZWF0ZVRyYW5zcG9ydFBhY2tlciB9IGZyb20gJy4vdHJhbnNwb3J0J1xuXG5leHBvcnQgeyBNZXNzYWdlV3JhcHBlciB9IGZyb20gJy4vdHJhbnNwb3J0J1xuZXhwb3J0IGNvbnN0IGNyZWF0ZU5ldGNvZGUgPSAoKSA9PiB7XG4gIGNvbnN0IHRyYW5zcG9ydCA9IGNyZWF0ZVRyYW5zcG9ydFBhY2tlcigpXG5cbiAgcmV0dXJuIHRyYW5zcG9ydFxufVxuIiwgImltcG9ydCB7IGNyZWF0ZU5ldGNvZGUgfSBmcm9tICcuLi9uNTMnXG5pbXBvcnQgeyBMb2dpblJlcXVlc3QgfSBmcm9tICcuL0xvZ2luUmVxdWVzdCdcbmltcG9ydCB7IE5lYXJieUVudGl0aWVzIH0gZnJvbSAnLi9OZWFyYnlFbnRpdGllcydcbmltcG9ydCB7IFBvc2l0aW9uVXBkYXRlIH0gZnJvbSAnLi9Qb3NpdGlvblVwZGF0ZSdcbmltcG9ydCB7IFNlc3Npb24gfSBmcm9tICcuL1Nlc3Npb24nXG5cbmV4cG9ydCB0eXBlIEFueU1lc3NhZ2UgPVxuICB8IExvZ2luUmVxdWVzdFxuICB8IFNlc3Npb25cbiAgfCBQb3NpdGlvblVwZGF0ZVxuICB8IE5lYXJieUVudGl0aWVzXG5cbmV4cG9ydCB7IE5lYXJieUVudGl0aWVzLCBMb2dpblJlcXVlc3QsIFBvc2l0aW9uVXBkYXRlLCBTZXNzaW9uIH1cblxuZXhwb3J0IGVudW0gTWVzc2FnZVR5cGVzIHtcbiAgTG9naW4gPSAxLFxuICBTZXNzaW9uID0gMixcbiAgTmVhcmJ5RW50aXRpZXMgPSAzLFxuICBQb3NpdGlvblVwZGF0ZSA9IDQsXG59XG5leHBvcnQgY29uc3QgbmV0Y29kZSA9IGNyZWF0ZU5ldGNvZGUoKVxuIiwgIi8vLyA8cmVmZXJlbmNlIGxpYj1cImRvbVwiLz5cblxuaW1wb3J0IHsgY3JlYXRlQ2xpZW50TmV0Y29kZSB9IGZyb20gJy4uL2NsaWVudCdcbmltcG9ydCB7XG4gIEVycm9yTWVzc2FnZSxcbiAgTG9nTWVzc2FnZSxcbiAgTWVzc2FnZUJhc2UsXG4gIFBpbmdNZXNzYWdlLFxuICBQb25nTWVzc2FnZSxcbiAgUmVhZHlNZXNzYWdlLFxuICBXb3JrZXJNZXNzYWdlVHlwZXMsXG59IGZyb20gJy4uL3JuLXdlYndvcmtlcidcblxuY29uc3QgeyBsb2cgfSA9IHdpbmRvd1xuXG5leHBvcnQgaW50ZXJmYWNlIExvZ2luTWVzc2FnZSBleHRlbmRzIE1lc3NhZ2VCYXNlPCdsb2dpbic+IHtcbiAgaWRUb2tlbjogc3RyaW5nXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSGVhcnRiZWF0TWVzc2FnZSBleHRlbmRzIE1lc3NhZ2VCYXNlPCdoZWFydGJlYXQnPiB7fVxuXG5leHBvcnQgdHlwZSBBbnlNZXNzYWdlID0gV29ya2VyTWVzc2FnZVR5cGVzIHwgTG9naW5NZXNzYWdlIHwgSGVhcnRiZWF0TWVzc2FnZVxuXG5jb25zdCBoZWFydGJlYXQgPSAoKSA9PiB7XG4gIHdpbmRvdy5zZW5kKHsgdHlwZTogJ2hlYXJ0YmVhdCcgfSlcbiAgc2V0VGltZW91dChoZWFydGJlYXQsIDUwMClcbn1cbmhlYXJ0YmVhdCgpXG5cbmV4cG9ydCB0eXBlIERpc3BhdGNoSGFuZGxlcjxUTWVzc2FnZT4gPSAobXNnOiBUTWVzc2FnZSkgPT4gdm9pZFxuZXhwb3J0IHR5cGUgRGlzcGF0Y2hMb29rdXAgPSB7XG4gIGxvZz86IERpc3BhdGNoSGFuZGxlcjxMb2dNZXNzYWdlPlxuICBsb2dpbj86IERpc3BhdGNoSGFuZGxlcjxMb2dpbk1lc3NhZ2U+XG4gIGhlYXJ0YmVhdD86IERpc3BhdGNoSGFuZGxlcjxIZWFydGJlYXRNZXNzYWdlPlxuICBwaW5nPzogRGlzcGF0Y2hIYW5kbGVyPFBpbmdNZXNzYWdlPlxuICBwb25nPzogRGlzcGF0Y2hIYW5kbGVyPFBvbmdNZXNzYWdlPlxuICBlcnJvcj86IERpc3BhdGNoSGFuZGxlcjxFcnJvck1lc3NhZ2U+XG4gIHJlYWR5PzogRGlzcGF0Y2hIYW5kbGVyPFJlYWR5TWVzc2FnZT5cbn1cblxud2luZG93Lm9uTWVzc2FnZSgobXNnKSA9PiB7XG4gIGNvbnN0IF9tc2cgPSBtc2cgYXMgQW55TWVzc2FnZVxuICBjb25zdCBkaXNwYXRjaDogRGlzcGF0Y2hMb29rdXAgPSB7fVxuICBjb25zdCBfZCA9IGRpc3BhdGNoW19tc2cudHlwZSBhcyBBbnlNZXNzYWdlWyd0eXBlJ11dIGFzIERpc3BhdGNoSGFuZGxlcjxBbnlNZXNzYWdlPlxuICBpZiAoIV9kKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBNZXNzYWdlIHR5cGUgJHtfbXNnLnR5cGV9IGlzIG5vdCBpbXBsZW1lbnRlZGApXG4gIH1cbiAgX2QoX21zZylcbiAgbG9nKCdSeCBtYWluLT53b3JrZXInLCB7IF9tc2cgfSlcbn0pXG5cbmNvbnN0IGNsaWVudCA9IGNyZWF0ZUNsaWVudE5ldGNvZGUoe1xuICBsb2dnZXI6IHtcbiAgICBpbmZvOiBsb2csXG4gICAgZGVidWc6IGxvZyxcbiAgICBlcnJvcjogbG9nLFxuICAgIHdhcm46IGxvZyxcbiAgfSxcbn0pXG5cbi8vIHZhciBleGFtcGxlU29ja2V0ID0gbmV3IFdlYlNvY2tldCgnd3M6Ly9sb2NhbGhvc3Q6MzAwMCcpXG4vLyBsb2coJ2dvdCB0aGF0IHNvY2tldCcpXG5cbi8vIGV4YW1wbGVTb2NrZXQub25vcGVuID0gKGV2ZW50KSA9PiB7XG4vLyAgIGxvZygnb25vcGVuJylcbi8vICAgZXhhbXBsZVNvY2tldC5zZW5kKCdoZWxsbyB3b3JsZCcpXG4vLyB9XG5cbi8vIGV4YW1wbGVTb2NrZXQub25lcnJvciA9IChlKSA9PiB7XG4vLyAgIGxvZygnb25lcnJvcicsIGUpXG4vLyB9XG5cbi8vIGV4YW1wbGVTb2NrZXQub25tZXNzYWdlID0gKG0pID0+IHtcbi8vICAgbG9nKCdvbm1lc3NhZ2UnLCBtKVxuLy8gfVxuXG4vLyBleGFtcGxlU29ja2V0Lm9uY2xvc2UgPSAoKSA9PiB7XG4vLyAgIGxvZygnb25jbG9zZScpXG4vLyB9XG5cbndpbmRvdy5yZWFkeSgpXG4iXSwKICAibWFwcGluZ3MiOiAidWlCQUFBLGtCQUVBLEdBQUksR0FBSyxLQUVULEFBQUksTUFBTyxZQUFjLFlBQ3ZCLEVBQUssVUFDQSxBQUFJLE1BQU8sZUFBaUIsWUFDakMsRUFBSyxhQUNBLEFBQUksTUFBTyxTQUFXLFlBQzNCLEVBQUssT0FBTyxXQUFhLE9BQU8sYUFDM0IsQUFBSSxNQUFPLFNBQVcsWUFDM0IsRUFBSyxPQUFPLFdBQWEsT0FBTyxhQUN2QixNQUFPLE9BQVMsYUFDekIsR0FBSyxLQUFLLFdBQWEsS0FBSyxjQUc5QixFQUFPLFFBQVUsSUNoQmpCLE1BQTJCLFFDQTNCLEdBQUksR0FBbUIsSUFBTyxFQUM1QixPQUFRLEdBQ1IsS0FBTSxLQUFVLEdBQ2IsQUFBQyxNQUFLLE9BQU8sSUFBVSxJQUFJLFFBQVEsR0FBSyxFQUFFLEdBQUcsS0FFaEQsR0FBSSxFQUFPLEdBQ1IsTUFBQyxNQUFL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\n'

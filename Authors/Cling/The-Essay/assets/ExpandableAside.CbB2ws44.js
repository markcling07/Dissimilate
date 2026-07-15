import{r as R}from"./index.DBy5LfQW.js";var x={exports:{}},s={};/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var l;function c(){if(l)return s;l=1;var i=Symbol.for("react.transitional.element"),a=Symbol.for("react.fragment");function r(u,e,t){var o=null;if(t!==void 0&&(o=""+t),e.key!==void 0&&(o=""+e.key),"key"in e){t={};for(var d in e)d!=="key"&&(t[d]=e[d])}else t=e;return e=t.ref,{$$typeof:i,type:u,key:o,ref:e!==void 0?e:null,props:t}}return s.Fragment=a,s.jsx=r,s.jsxs=r,s}var p;function v(){return p||(p=1,x.exports=c()),x.exports}var n=v();function j({label:i,children:a}){const[r,u]=R.useState(!0);return n.jsxs("aside",{className:`aside-note${r?" is-open":""}`,children:[n.jsxs("button",{type:"button",className:"aside-toggle","aria-expanded":r,onClick:()=>u(!r),children:[i," ",n.jsx("span",{"aria-hidden":"true",children:r?"−":"+"})]}),n.jsx("div",{className:"aside-body",hidden:!r,children:a})]})}export{j as default};

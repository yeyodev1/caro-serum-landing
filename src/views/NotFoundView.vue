<template>
  <main class="not-found">
    <p>OMG LASHES</p>
    <span>404</span>
    <h1>Esta mirada<br />se perdio.</h1>
    <p>La pagina que buscas no existe o ya cambio de lugar.</p>
    <RouterLink to="/">Volver a OMG Lashes <b>→</b></RouterLink>
  </main>
</template>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Playfair+Display:ital,wght@0,500;0,600&display=swap');

.not-found { align-items:center; background:#f4d9d5; color:#211e1d; display:flex; flex-direction:column; justify-content:center; min-height:100vh; overflow:hidden; padding:30px; position:relative; text-align:center; }
.not-found::before { border:1px solid rgba(184,111,84,.4); border-radius:50%; content:''; height:min(66vw,780px); position:absolute; width:min(66vw,780px); }
.not-found > * { position:relative; }.not-found > p:first-child { font:500 11px 'DM Mono',monospace; letter-spacing:.14em; }.not-found span { color:#b86f54; font:600 clamp(80px,15vw,190px)/.8 'Playfair Display',serif; margin-top:30px; }.not-found h1 { font:600 clamp(45px,7vw,88px)/.92 'Playfair Display',serif; letter-spacing:-.06em; margin:18px 0; }.not-found > p:nth-of-type(2) { font:14px/1.6 'DM Mono',monospace; max-width:360px; }.not-found a { background:#211e1d; color:#fbf7f2; font:500 11px 'DM Mono',monospace; letter-spacing:.08em; margin-top:32px; padding:17px 20px; text-transform:uppercase; }.not-found b { font-size:17px; margin-left:25px; }
</style>

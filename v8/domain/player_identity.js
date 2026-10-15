/* Apply only sourced biography corrections; model peaks and exit dates remain separate. */
window.GCC8_applyIdentity=p=>{const identity=window.GCC8_IDENTITIES[p.name];if(identity){p.birthDate=identity.birthDate;p.birthYear=Number(identity.birthDate.slice(0,4));}};

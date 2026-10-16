"""Source-owned protection against a detected stale instance overwriting saves.

The comparison protects sequential interleavings, not an atomic cross-process
transaction. Continue and an explicitly requested new world adopt current storage.
"""
def adapt(name, script):
    if name != 'dynasty':
        return script
    marker = '  let saveFailureShown=false;'
    assert script.count(marker) == 1
    script = script.replace(marker, marker + "\n  let lastStoredSave=safeStorageGet(SAVE_KEY),saveConflict=false;")
    old = "try{state.dynasty.saveStamp=Date.now();state.dynasty.version=SAVE_VERSION;localStorage.setItem(SAVE_KEY,JSON.stringify(serialisable()));writeSaveMeta();"
    assert script.count(old) == 1
    script = script.replace(old, "try{if(localStorage.getItem(SAVE_KEY)!==lastStoredSave){saveConflict=true;base.toast('Another open game saved newer progress. Return home and choose Continue before playing on.');return false}saveConflict=false;state.dynasty.saveStamp=Date.now();state.dynasty.version=SAVE_VERSION;const nextSave=JSON.stringify(serialisable());localStorage.setItem(SAVE_KEY,nextSave);lastStoredSave=nextSave;writeSaveMeta();")
    old = 'function startFreshWorld(args=[]){'
    assert script.count(old) == 1
    script = script.replace(old, old + 'lastStoredSave=safeStorageGet(SAVE_KEY);saveConflict=false;')
    old = 'save=migrateLoadedSave(save);G.closeModal();'
    assert script.count(old) == 1
    script = script.replace(old, 'save=migrateLoadedSave(save);lastStoredSave=localStorage.getItem(SAVE_KEY);saveConflict=false;G.closeModal();')
    old = 'const previous=JSON.stringify(state),previousScreen=currentScreen;'
    assert script.count(old) == 1
    script = script.replace(old, 'const previous=JSON.stringify(state),previousScreen=currentScreen,previousStoredSave=lastStoredSave,previousSaveConflict=saveConflict;')
    old = 'currentScreen=previousScreen;base.go(previousScreen);'
    assert script.count(old) == 1
    script = script.replace(old, 'lastStoredSave=previousStoredSave;saveConflict=previousSaveConflict;currentScreen=previousScreen;base.go(previousScreen);')
    old = 'save:()=>autoSave(),xiProblem:'
    assert script.count(old) == 1
    script = script.replace(old, 'save:()=>autoSave(),saveConflict:()=>saveConflict,xiProblem:')
    old = 'const nextSave=JSON.stringify(serialisable());'
    assert script.count(old) == 1
    script = script.replace(old, 'const nextSave=window.GCC8_SAVE_CODEC.stringify(serialisable());')
    old = 'let save=JSON.parse(stored.raw);'
    assert script.count(old) == 1
    script = script.replace(old, 'let save=window.GCC8_SAVE_CODEC.parse(stored.raw);')
    return script

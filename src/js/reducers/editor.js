const editor = (state, action) => {
    if(state === undefined) {
        state = {
            code: localStorage.getItem('editor_code') || '',
            editor: null
        };
    }

    switch(action.type) {
        case 'SET_CODE':
            localStorage.setItem('editor_code', action.code);
            return Object.assign({}, state, { code: action.code });
        case 'SET_EDITOR':
            return Object.assign({}, state, { editor: action.editor });
        default:
            return state;
    }
};

export default editor;
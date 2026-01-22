import { createSlice } from '@reduxjs/toolkit';

const weatherSlice = createSlice({
    name: 'weather',
    initialState: {
        favorites: JSON.parse(localStorage.getItem('weather_favs')) || ['London', 'Mumbai'],
        unit: 'metric',
        isAuthenticated: false,
        user: null, // Stores name and picture from Google
    },
    reducers: {
        toggleFavorite: (state, action) => {
            const city = action.payload;
            if (state.favorites.includes(city)) {
                state.favorites = state.favorites.filter(c => c !== city);
            } else {
                state.favorites.push(city);
            }
            localStorage.setItem('weather_favs', JSON.stringify(state.favorites));
        },
        setUnit: (state, action) => { state.unit = action.payload; },
        setAuth: (state, action) => {
            state.isAuthenticated = true;
            state.user = action.payload; // Saves decoded JWT data
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
        }
    }
});

export const { toggleFavorite, setUnit, setAuth, logout } = weatherSlice.actions;
export default weatherSlice.reducer;
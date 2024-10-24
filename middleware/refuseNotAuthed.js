import passport from "passport";

const refuseNotAuthed = passport.authenticate("jwt", { session: false });

export { refuseNotAuthed };

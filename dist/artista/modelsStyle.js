"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtistStyleModel = exports.ArtistStyleSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
var ArtistType = mongoose_1.default.model('ArtistType');
exports.ArtistStyleSchema = new mongoose_2.Schema({
    nameArtistStyle: {
        type: String,
        unique: true,
        required: true,
    },
    idArtistType: {
        type: mongoose_2.Schema.Types.ObjectId,
        ref: "ArtistType",
    },
    id: {
        type: mongoose_2.Schema.Types.ObjectId,
    },
});
exports.ArtistStyleModel = mongoose_1.default.model("ArtistStyle", exports.ArtistStyleSchema);

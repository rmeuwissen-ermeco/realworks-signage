"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.demoItems = exports.demoStreams = void 0;
exports.demoStreams = {
    demo: {
        streamKey: "demo",
        tenantName: "Demo Makelaar",
        title: "Etalage – Actueel aanbod",
        width: 1920,
        height: 1080,
        secondsPerItem: 8,
        theme: {
            primary: "#1a73e8",
            accent: "#34a853",
            background: "#0b1020",
            text: "#ffffff"
        }
    }
};
exports.demoItems = {
    demo: [
        {
            id: "RW-0001",
            status: "Actief",
            addressLine: "Dorpsstraat 12",
            city: "Sittard",
            priceLine: "€ 349.000 k.k.",
            features: ["118 m²", "4 kamers", "Energielabel B"],
            imageUrl: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1600&q=80",
            updatedAtISO: new Date().toISOString()
        },
        {
            id: "RW-0002",
            status: "Onder bod",
            addressLine: "Parklaan 7",
            city: "Geleen",
            priceLine: "€ 289.000 k.k.",
            features: ["96 m²", "3 kamers", "Energielabel C"],
            imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
            updatedAtISO: new Date().toISOString()
        },
        {
            id: "RW-0003",
            status: "Verkocht",
            addressLine: "Heuvelweg 3",
            city: "Born",
            priceLine: "€ 415.000 v.o.n.",
            features: ["142 m²", "5 kamers", "Energielabel A"],
            imageUrl: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1600&q=80",
            updatedAtISO: new Date().toISOString()
        }
    ]
};

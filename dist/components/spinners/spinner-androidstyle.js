"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AndroidStyleSpinner = void 0;
const base_1 = require("../base");
/**
 * 安卓风格的加载指示器, 基于Lottie实现, 效果是一个圆环一边旋转一边缩放。由于帧数有限，不建议在大视图上使用。
 */
class AndroidStyleSpinner extends base_1.Base {
    /**
     * @param props AndroidStyleSpinnerProps
     *        - id?: string 可以重新指定 id，以供 list 或者 matrix 的 template 使用
     *        - weight: number
     *        - diameter: number
     *        - color: UIColor, 默认 gray
     *        - bgcolor: UIColor, 默认 clear
     * @param layout 可选布局，默认居中
     */
    constructor({ props, layout }) {
        super();
        this._props = Object.assign({ weight: 2, diameter: 24, color: $color("gray"), bgcolor: $color("clear") }, props);
        this._defineView = () => {
            const weight = this._props.weight;
            const color = this._props.color;
            const r = color.components.red / 255;
            const g = color.components.green / 255;
            const b = color.components.blue / 255;
            const a = color.components.alpha;
            const json = {
                v: "5.5.7",
                fr: 60,
                ip: 0,
                op: 120,
                w: 24,
                h: 24,
                nm: "spinner",
                ddd: 0,
                assets: [],
                layers: [
                    {
                        ddd: 0,
                        ind: 1,
                        ty: 4,
                        nm: "circle",
                        sr: 1,
                        ks: {
                            o: { a: 0, k: 100, ix: 11 },
                            r: {
                                a: 1,
                                k: [
                                    {
                                        i: { x: [0.833], y: [0.833] },
                                        o: { x: [0.167], y: [0.167] },
                                        t: 0,
                                        s: [0]
                                    },
                                    {
                                        t: 119,
                                        s: [720]
                                    }
                                ],
                                ix: 10
                            },
                            p: { a: 0, k: [12, 12, 0], ix: 2 },
                            a: { a: 0, k: [1, 1, 0], ix: 1 },
                            s: { a: 0, k: [100, 100, 100], ix: 6 }
                        },
                        ao: 0,
                        shapes: [
                            {
                                ty: "gr",
                                it: [
                                    {
                                        ind: 0,
                                        ty: "sh",
                                        ix: 1,
                                        ks: {
                                            a: 0,
                                            k: {
                                                i: [
                                                    [0, -5.523],
                                                    [5.523, 0],
                                                    [0, 5.523],
                                                    [-5.523, 0]
                                                ],
                                                o: [
                                                    [0, 5.523],
                                                    [-5.523, 0],
                                                    [0, -5.523],
                                                    [5.523, 0]
                                                ],
                                                v: [
                                                    [11, 1],
                                                    [1, 11],
                                                    [-9, 1],
                                                    [1, -9]
                                                ],
                                                c: true
                                            },
                                            ix: 2
                                        },
                                        nm: "Path 1",
                                        mn: "ADBE Vector Shape - Group",
                                        hd: false
                                    },
                                    {
                                        ty: "mm",
                                        mm: 3,
                                        nm: "Merge Paths 1",
                                        mn: "ADBE Vector Filter - Merge",
                                        hd: false
                                    },
                                    {
                                        ty: "tm",
                                        s: {
                                            a: 1,
                                            k: [
                                                {
                                                    i: { x: [0.833], y: [0.833] },
                                                    o: { x: [0.167], y: [0.167] },
                                                    t: 0,
                                                    s: [0]
                                                },
                                                {
                                                    i: { x: [0.833], y: [0.833] },
                                                    o: { x: [0.167], y: [0.167] },
                                                    t: 60,
                                                    s: [0]
                                                },
                                                {
                                                    i: { x: [0.833], y: [0.833] },
                                                    o: { x: [0.167], y: [0.167] },
                                                    t: 90,
                                                    s: [60]
                                                },
                                                {
                                                    t: 119,
                                                    s: [100]
                                                }
                                            ],
                                            ix: 1
                                        },
                                        e: {
                                            a: 1,
                                            k: [
                                                {
                                                    i: { x: [0.833], y: [0.833] },
                                                    o: { x: [0.167], y: [0.167] },
                                                    t: 0,
                                                    s: [0]
                                                },
                                                {
                                                    i: { x: [0.833], y: [0.833] },
                                                    o: { x: [0.167], y: [0.167] },
                                                    t: 30,
                                                    s: [70]
                                                },
                                                {
                                                    i: { x: [0.833], y: [0.833] },
                                                    o: { x: [0.167], y: [0.167] },
                                                    t: 60,
                                                    s: [90]
                                                },
                                                {
                                                    i: { x: [0.833], y: [0.833] },
                                                    o: { x: [0.167], y: [0.167] },
                                                    t: 90,
                                                    s: [90]
                                                },
                                                {
                                                    t: 119,
                                                    s: [99]
                                                }
                                            ],
                                            ix: 2
                                        },
                                        o: { a: 0, k: 0, ix: 3 },
                                        m: 1,
                                        ix: 3,
                                        nm: "Trim Paths 1",
                                        mn: "ADBE Vector Filter - Trim",
                                        hd: false
                                    },
                                    {
                                        ty: "st",
                                        c: { a: 0, k: [r, g, b, a], ix: 3 },
                                        o: { a: 0, k: 100, ix: 4 },
                                        w: { a: 0, k: weight, ix: 5 },
                                        lc: 2,
                                        lj: 1,
                                        ml: 4,
                                        bm: 0,
                                        nm: "Stroke 1",
                                        mn: "ADBE Vector Graphic - Stroke",
                                        hd: false
                                    },
                                    {
                                        ty: "tr",
                                        p: { a: 0, k: [0, 0], ix: 2 },
                                        a: { a: 0, k: [0, 0], ix: 1 },
                                        s: { a: 0, k: [100, 100], ix: 3 },
                                        r: { a: 0, k: 0, ix: 6 },
                                        o: { a: 0, k: 100, ix: 7 },
                                        sk: { a: 0, k: 0, ix: 4 },
                                        sa: { a: 0, k: 0, ix: 5 },
                                        nm: "Transform"
                                    }
                                ],
                                nm: "circle",
                                np: 4,
                                cix: 2,
                                bm: 0,
                                ix: 1,
                                mn: "ADBE Vector Group",
                                hd: false
                            }
                        ],
                        ip: 0,
                        op: 120,
                        st: 0,
                        bm: 0
                    }
                ],
                markers: []
            };
            return {
                type: "lottie",
                props: {
                    loop: true,
                    contentMode: 1,
                    circular: true,
                    json,
                    bgcolor: this._props.bgcolor,
                    id: this._props.id || this.id
                },
                layout: layout || ((make, view) => {
                    make.size.equalTo($size(this._props.diameter, this._props.diameter));
                    make.center.equalTo(view.super);
                }),
                events: {
                    ready: sender => sender.play({})
                }
            };
        };
    }
}
exports.AndroidStyleSpinner = AndroidStyleSpinner;

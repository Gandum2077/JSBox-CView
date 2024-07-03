"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImagePager = void 0;
const base_1 = require("./base");
const single_views_1 = require("./single-views");
/**
 * 图片浏览组件
 *
 * 与内置的Gallery组件相比，ImagePager组件可以动态刷新，适用于图片数量较多的场景，以及需要动态加载图片列表的场景
 *
 */
class ImagePager extends base_1.Base {
    /**
     *
     * @param props
     * - srcs: string[] - 图片地址列表
     * - page: number - 当前页码
     * @param layout
     * @param events
     * - changed: (page: number) => void - 页码变化时触发
     * - tapped: (sender: ImagePager) => void - 点击图片时触发
     */
    constructor({ props, layout, events = {} }) {
        super();
        this._props = Object.assign({ srcs: [], page: 0 }, props);
        this._pageLoadRecorder = {};
        this._matrix = new single_views_1.Matrix({
            props: {
                direction: $scrollDirection.horizontal,
                pagingEnabled: true,
                alwaysBounceVertical: false,
                showsVerticalIndicator: false,
                showsHorizontalIndicator: false,
                template: {
                    views: [
                        {
                            type: "scroll",
                            props: {
                                id: "scroll",
                                zoomEnabled: true,
                                maxZoomScale: 3,
                                doubleTapToZoom: true
                            },
                            layout: $layout.fill,
                            views: [
                                {
                                    type: "image",
                                    props: {
                                        id: "image",
                                        contentMode: $contentMode.scaleAspectFit
                                    }
                                }
                            ]
                        }
                    ]
                },
                data: this._props.srcs.map(n => {
                    return { image: { src: n } };
                })
            },
            layout: $layout.fill,
            events: {
                ready: sender => {
                    // 如果没有此处的relayout，则会出现莫名其妙的bug
                    sender.relayout();
                    this.page = this.page;
                    this.loadsrc(this.page);
                },
                itemSize: (sender, indexPath) => {
                    return $size(sender.frame.width, sender.frame.height);
                },
                forEachItem: (view, indexPath) => {
                    const scroll = view.get("scroll");
                    scroll.zoomScale = 0;
                    //$delay(0.01, () => {});
                },
                willEndDragging: (sender, velocity, target) => {
                    const oldPage = this.page;
                    this._props.page = Math.round(target.x / sender.frame.width);
                    //this.loadsrc(this.page, true);
                    if (oldPage !== this.page && events.changed)
                        events.changed(this.page);
                },
                didScroll: sender => {
                    this.loadsrc(this.page + 1, true);
                    this.loadsrc(this.page - 1, true);
                }
            }
        });
        this._defineView = () => {
            return {
                type: "view",
                props: {
                    id: this.id,
                    userInteractionEnabled: true
                },
                layout,
                views: [this._matrix.definition],
                events: {
                    layoutSubviews: sender => {
                        this._pageLoadRecorder = {};
                        sender.relayout();
                        this._matrix.view.reload();
                        this.page = this.page;
                        $delay(0.1, () => this.loadsrc(this.page, true));
                        $delay(0.3, () => this.loadsrc(this.page, true));
                    },
                    tapped: sender => {
                        const cell = this._matrix.view.cell($indexPath(0, this.page));
                        if (!cell)
                            return;
                        const scroll = cell.get("scroll");
                        const zoomScale = scroll.zoomScale;
                        $delay(0.3, () => {
                            const zoomScale1 = scroll.zoomScale;
                            if (zoomScale === zoomScale1 && events.tapped)
                                events.tapped(this);
                        });
                    }
                }
            };
        };
    }
    loadsrc(page, forced = false) {
        if (page < 0 || page >= this._props.srcs.length)
            return;
        const cell = this._matrix.view.cell($indexPath(0, page));
        if (!cell)
            return;
        const image = cell.get("image");
        if (forced || !image.image || !this._pageLoadRecorder[page]) {
            const scroll = cell.get("scroll");
            scroll.zoomScale = 0;
            this._pageLoadRecorder[page] = true;
        }
    }
    get page() {
        return this._props.page;
    }
    get currentImage() {
        const cell = this._matrix.view.cell($indexPath(0, this.page));
        if (!cell)
            return;
        const image = cell.get("image");
        return image.image;
    }
    set page(page) {
        this._matrix.view.scrollTo({
            indexPath: $indexPath(0, page),
            animated: false
        });
        this._props.page = page;
    }
    scrollToPage(page) {
        this._matrix.view.scrollTo({
            indexPath: $indexPath(0, page),
            animated: true
        });
        this._props.page = page;
    }
}
exports.ImagePager = ImagePager;

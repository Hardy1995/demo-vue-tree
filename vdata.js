/**
 * @file 使用vue渲染数据
 * @author muzhilong
 */
var width = 800;
var height = 600;
var blockHeight = 30;

/* global Vue,json*/
new Vue({
    el: '#app',
    data: {
        root: null
    },
    created: function () {
        this.initData(json);
    },
    computed: {
        list: function () {
            var list = [];
            list.push(this.root);
            var index = 0;
            while (index < list.length) {
                var children = list[index].children;
                if (children && children.length > 0) {
                    children.forEach(v => {
                        list.push(v);
                    });
                }

                index += 1;
            }
            return list;
        },
        // 分层数据
        levels: function () {
            var arr = [];
            this.list.forEach(function (v) {
                if (!arr[v.deep]) {
                    arr[v.deep] = [];
                }
                var level = arr[v.deep];
                v.prev = level[level.length - 1];
                level.push(v);
                
            });
            this.calcTop();
            return arr;
        }
    },
    mounted: function () {
        console.log('mounted');
        console.log(this.levels);
    },
    methods: {
        // 初始化数据： 计算deep等
        initData: function (data) {
            if (!data.deep) {
                data.deep = 0;
                data.open = true;
                data.top = 0;
                data.height = 0;
                data.path = '';
                data.left = data.deep * 150 + 10;
            }

            var me = this;
            if (data.children && data.children.length > 0) {
                data.children.forEach(function (v, index) {
                    v.parent = data;
                    v.deep = data.deep + 1;
                    v.open = v.deep < 3; // 默认展示3层
                    v.index = index;
                    v.top = 0;
                    v.left = v.deep * 150 + 10;
                    v.height = 0;
                    v.path = '';
                    me.initData(v);
                });
            }
            else {
                data.isLeaf = true;
            }
            this.calcHeightAndShow(data);
            if (data.deep === 0) {
                this.root = data;
            }
        },
        // 计算所有节点占用的高度和是否展示
        calcHeightAndShow: function (vnode) {
            var me = this;
            var height = 0;
            if (vnode.parent && !vnode.parent.open) {
                // 存在父节点并且父节点不展开
                vnode.height = 0;
                vnode.open = false;
            }
            else if (!vnode.open) {
                vnode.height = blockHeight;
            }

            if (vnode.children && vnode.children.length > 0) {
                vnode.children.forEach(function (v) {
                    me.calcHeightAndShow(v);
                    height += v.height;
                });
            }

            if (vnode.open) {
                vnode.height = height || blockHeight;
            }

        },
        // 计算节点的位置
        calcTop: function () {
            this.list.forEach(function (v) {
                if (v.prev && v.prev.parent === v.parent) {
                    // 拥有相同的父节点
                    v.top = v.height / 2 + (v.prev.top + v.prev.height / 2);
                }
                else if (v.parent && v.parent.prev) {
                    // 父节点拥有上一个节点
                    v.top = v.height / 2 + (v.parent.prev.top + v.parent.prev.height / 2);
                }
                else if (v.prev) {
                    v.top = v.height / 2 + (v.prev.top + v.prev.height / 2);
                }
                else {
                    v.top = v.height / 2;
                }
                if (v.parent) {
                    var pLeft = v.parent.left + 65;
                    var pTop = v.parent.top;
                    var mLeft = (v.left + pLeft) / 2;
                    var mTop = (v.top + pTop) / 2;
                    v.path = 'M' + v.left + ' ' + v.top
                        + ' C ' + mLeft + ' ' + v.top + ',' + mLeft + ' ' + pTop
                        + ',' + pLeft + ' ' + pTop;
                }
            });
        },
        // 收缩和展开
        toggle: function (vnode) {
            vnode.open = !vnode.open;
            console.log('toggle:', vnode, vnode.open);
            this.calcHeightAndShow(this.root);
            console.log('toggle2:', vnode, vnode.open);
            this.calcTop();
            console.log('toggle3:', vnode, vnode.open);
        }
    }
});

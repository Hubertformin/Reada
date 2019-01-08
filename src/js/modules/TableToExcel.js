/*
File: Convert HTML table to excel
Date: 21/11/2018 01:24 AM
Author: Hubert Formin
*/
/**
 * @fileOverview defines a public method for converting a table or array into an excel table
 */
(function(){
    /**
     * @class TableToExcel defines a public method for converting a table or array into an excel table
     */
    TableToExcel = function() {}
        /**
         * @lends TableToExcel.prototype
         */
    TableToExcel.prototype = {
            /**
             * Determine IE and non-IE browsers
             */
            checkIsIE: !!(navigator.userAgent.indexOf('Trident') > -1 && navigator.userAgent.indexOf('Opera') === -1),
            /**
             * if MAC
             */
            checkIsMac:navigator.userAgent.indexOf('Mac') != -1,
            /**
             * Entrance
             * @param {string} table The value of the id attribute of the table in the page. If the value is not passed, the table is generated from a two-dimensional array.
             */
            render: function(param,title){
                if(this.checkIsIE) {
                    this.createExcelIE(param, title);
                }else {
                    this.createExcel(param, title)
                }
            },
            /**
             * Create a table, the argument passed by the render method is called when the array is
             * @param {Array} param Array passed to the interface
             * Array format
             * @example 
             * var obj=[
                ['LastName','Sales','Country','Quarter'],
                ['Smith','16753','UK','Qtr 3'],
                ['Johnson','14808','USA','Qtr 4']
            ];
            */
           createTable: function(param, title) {
               var trLen = param.length;
               var tdLen = param[0].length;
               var trArr = [];
               var style = this.checkIsMac?"":'mso-number-format:"\@"';
               if(title) {
                   var hdLen = title.length;
                   for(var n = 0;n < hdLen; n++) {
                       var border = n % 2 != 0 ? "border-top:1px solid #fff;":"";
                       trArr.push('<tr><td style="background:'+title[n],bg+';color:'+title[n].color+';" colspan="'+param[0].length+'">'+title[n].text+'</td></tr>');
                   }
               }
               for(var i = 0; n < trLen; i++ ) {
                   var tdArr = [];
                   for(var o = 0;o < tdLen; o++) {
                        var tdHtml = '<td style="'+ style +'">' + param[i][o] + '</td>';
                        tdArr.push(tdHtml);
                   }
                   var trHtml = '<tr>'+ tdArr.join("") +'</tr>';
                   trArr.push(trHtml);
               }
               return trArr.join("");
           },
           /**
            * Generate excel non-IE browser based on the table stored in the page
            * @param {String} param the id of the table in page 
            * or
            * @param {Array} param Two-dimensional array passed from the interface
            * and
            * @param {Function} param callback function to be passed
            */
           createExcel: function({id,title,name,fileName}) {
                var self = this;
                var tableHtml = null;
                var func = (function(){
                    var uri = 'data:application/vnd.ms-excel;base64,';
                    var template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><style>td{mso-number-format:"\@";}</style></head><body><table>{table}</table></body></html>';
                    var base64 = function(s) {
                        return window.btoa(unescape(encodeURIComponent(s)))
                    };
                    var format = function(s, c) {
                        return s.replace(/{(\w+)}/g, function(m, p){
                            return c[p];
                        })
                    }
                    return function() {
                        if(typeof(id) == "string") {
                            tableHtml = document.getElementById(id).innerHTML;
                        } else {
                           tableHtml = self.createTable(id, title);
                        }
                        var ctx = {
                            worksheet: name || 'Worksheet',
                            table: tableHtml
                        }
                        var link = document.createElement("a");
                        link.href = uri + base64(format(template, ctx));
                        link.download = fileName+'.xls';
                        document.body.appendChild(link);
                        link.click();
                   }
                })();
                func()
            },
           /**
            * 
            * @param {String} param id of the table to export
            * or
            * @param {Array} param two dimensional array included from interface
            */
            createExcelIE: function(param, title,callback) {
                var tableHtml = null;
                if (typeof(param) == "string") {
                    tableHtml = document.getElementById(param).outerHTML;
                } else {
                    tableHtml = '<table>' + this.createTable(param, title) + '</table>';
                }

                window.clipboardData.setData("Text", tableHtml);
                var objExcel = new ActiveXObject("Excel.Application");
                objExcel.visible = true;
                var objWorkbook = objExcel.Workbooks.Add;
                var objWorksheet = objWorkbook.Worksheets(1);
                objWorksheet.Paste;
            }
    }
        //AMD && CMD
    if (typeof define === 'function') {
        define(function() {
            return TableToExcel;
        });
        // commonJS
    } else if(typeof module !== 'undefined' && module !== null) {
        module.exports = TableToExcel;
    } else {
        window.TableToExcel = TableToExcel;
    }
})();
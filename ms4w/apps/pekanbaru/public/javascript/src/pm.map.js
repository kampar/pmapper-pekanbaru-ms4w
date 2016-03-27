
/******************************************************************************
 *
 * Purpose: main interaction with Mapserver specific requests 
 *          like zoom, pan, etc. 
 * Author:  Armin Burger
 *
 ******************************************************************************
 *
 * Copyright (c) 2003-2011 Armin Burger
 *
 * This file is part of p.mapper.
 *
 * p.mapper is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version. See the COPYING file.
 *
 * p.mapper is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with p.mapper; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 *
 ******************************************************************************/


$.extend(PM.Map,
{
    
    /**
     * FUNCTION IS CALLED BY ZOOMBOX -> FUNCTION chkMouseUp(e)
     * main function for zoom/pan interface
     * calls different zoom functions (see below)
     */
    zoombox_apply: function(minx, miny, maxx, maxy) {
        var imgbox = minx + "+" + miny + "+" + maxx + "+" + maxy;
        var imgxy  = minx + "+" + miny;
        //alert(imgbox);
        // NORMAL MOUSE ACTIONS IN MAIN MAP //
        if (PM.ZoomBox.refmapClick == false) {

            // ZOOM/PAN ACTIONS
            var vmode = PM.Map.mode;
            
            if (vmode == 'map' || PM.ZoomBox.rightMouseButton) {
                // Only click
                if ((minx + this.zoomJitter) > maxx && (miny + this.zoomJitter) > maxy) {
                    if (PM.Map.zoom_type == 'zoomrect') {
                        if (PM.ZoomBox.rightMouseButton) {
                            var zoom_factor = 1; 
                        } else {
                            var zoom_factor = 2;
                        }
                        this.zoompoint(zoom_factor, imgxy);
                        
                    } else {
                       // Pan
                        if (PM.ZoomBox.rightMouseButton) {
                            var zoom_factor = 1; 
                        } else {
                            var zoom_factor = PM.Map.zoom_factor;
                        }
                        this.zoompoint(zoom_factor, imgxy);
                    }
                
                // Zoombox 
                } else {
                    this.zoomin(imgbox);
                }

            // QUERY/IDENTIFY ACTIONS
            // query on all visible groups
            } else if (vmode == 'query') {
                PM.Query.showQueryResult('query', imgxy);
            // query only on selected group with multiselect
            } else if (vmode == 'nquery') {
                var selform = _$("selform");
                if (!selform) return false;
                if (!selform.selgroup) return false;
                if (selform.selgroup.selectedIndex != -1) {
                    // only with single click
                    if ((minx + this.zoomJitter) > maxx && (miny + this.zoomJitter) > maxy) {     // x/y point
                        PM.Query.showQueryResult('nquery', imgxy);
                    // with zoom box
                    } else {
                        PM.Query.showQueryResult('nquery', imgbox);                      // rectangle
                    }
                }
            } else if (vmode == 'poi') {
                PM.Dlg.openPoi(imgxy);
            } else {
                try {
                    var fct = vmode + '_start';
                    if ($.isFunction(this[fct])) {
                        eval('this.' + fct + '(imgbox)');
                    }
                    return false;
                } catch(e) {
                	if (window.console) console.log(e);
                }
            }

        // ACTIONS IN REF MAP //
        } else {
            this.zoomref(imgxy);
        }
    },


    /**
     * Zoom to point
     */
    zoompoint: function(zoomfactor, imgxy) {
        var mapurl = PM_XAJAX_LOCATION + 'x_load.php?'+SID+'&mode=map&zoom_type=zoompoint&zoom_factor='+zoomfactor+'&imgxy='+imgxy;
        this.updateMap(mapurl);
    },

    /**
     * Zoom to rectangle
     */
    zoomin: function(extent) {
        var mapurl = PM_XAJAX_LOCATION + 'x_load.php?'+SID+'&mode=map&zoom_type=zoomrect&imgbox='+extent  ;
        //alert(mapurl);
        this.updateMap(mapurl);
    },

    /**
     * Zoom to geo-extent (map units), applied from info page link
     */
    zoom2extent: function(layer,idx,geoextent,zoomfull) {
        // Check if resultlayers shall be passed
        if (zoomfull == 1) {                            // no
            var layerstring = '';
        } else {
            var layerstring = '&resultlayer='+layer+'+'+idx;     // yes
        }
        var mapurl = PM_XAJAX_LOCATION + 'x_load.php?'+SID+'&mode=map&zoom_type=zoomextent&extent='+geoextent+layerstring;
        this.updateMap(mapurl);
    },

    /**
     * Zoom to full extent
     */
    zoomfullext: function() {
        var mapurl = PM_XAJAX_LOCATION + 'x_load.php?'+SID+'&mode=map&zoom_type=zoomfull';
        this.updateMap(mapurl);
    },

    /**
     * Go back to pevious extent
     */
    goback: function() {
        var mapurl = PM_XAJAX_LOCATION + 'x_load.php?'+SID+'&mode=map&zoom_type=zoomback';
        this.updateMap(mapurl);
    },

    /**
     * Go forward
     */
    gofwd: function() {
        var mapurl = PM_XAJAX_LOCATION + 'x_load.php?'+SID+'&mode=map&zoom_type=zoomfwd';
        this.updateMap(mapurl);
    },

    /**
     * Zoom to layer/group
     */
    zoom2group: function(gid) {
        var groupname = gid.replace(/ligrp_/, '');
        var mapurl = PM_XAJAX_LOCATION + 'x_load.php?'+SID+'&mode=map&zoom_type=zoomgroup&groupname=' + groupname;
        this.updateMap(mapurl);
    },

    /**
     * Zoom to selection
     */
    zoom2selected: function() {
        if (typeof(PM.extentSelectedFeatures)!='undefined') {
            if (PM.extentSelectedFeatures) {
                var mapurl = PM_XAJAX_LOCATION + 'x_load.php?'+SID+'&mode=map&zoom_type=zoomextent&extent='+PM.extentSelectedFeatures;
                this.updateMap(mapurl);
                //var mapurl = PM_XAJAX_LOCATION + 'x_load.php?'+SID+'&mode=map&zoom_type=zoomselected';
                //updateMap(mapurl);
            }
        }
    },

    /**
     * Draw map with new layers/groups
     */
    changeLayersDraw: function() {
        var mapurl = PM_XAJAX_LOCATION + 'x_load.php?'+SID+'&zoom_type=zoompoint';
        this.updateMap(mapurl);
    },

    /**
     * Stop loading on click
     */
    clickStopLoading: function() {
        this.stoploading();
        if (document.all) { 
            document.execCommand('Stop');
        } else {
            window.stop();
        }
    },

    /**
     * Pan via arrow buttons or keyboard
     */
    pansize: 0.1,    
    arrowpan: function(direction) {
        var px, py;
        if (direction == 'n') {
            px = (PM.mapW - 1) / 2;
            py = (0 + this.pansize) * PM.mapH;
        } else if (direction == 's') {
            px = (PM.mapW - 1) / 2;
            py = (1 - this.pansize) * PM.mapH;
        } else if (direction == 'e') {
            px = (1 - this.pansize) * PM.mapW;
            py = (PM.mapH - 1) / 2;
        } else if (direction == 'w') {
            px = (0 + this.pansize) * PM.mapW;
            py = (PM.mapH - 1) / 2;
        } else {
        	px = (PM.mapW - 1) / 2;
        	py = (PM.mapH - 1) / 2;
        }
        this.zoompoint(1, px + "+" + py);
    },

    /**
     * Reference image zoom/pan
     */
    zoomref: function(imgxy) {
        var mapurl = PM_XAJAX_LOCATION + 'x_load.php?'+SID+'&mode=map&zoom_type=ref&imgxy='+imgxy  ;
        this.updateMap(mapurl);
    },

    /**
     * Set overview image to new one
     */
    setRefImg: function(refimgsrc){
         var refimg = parent.refFrame.document.getElementById('refimg');
         refimg.src = refimgsrc;
    },

    /**
     * Zoom to scale
     */
    zoom2scale: function(scale) {
        var mapurl = PM_XAJAX_LOCATION + 'x_load.php?'+SID+'&mode=map&zoom_type=zoomscale&scale='+scale;
        this.updateMap(mapurl);
    },

    /**
     * Write scale to input field after map refresh
     */
    writescale: function(scale) {   
        if (_$("scaleform")) _$("scaleform").scale.value = scale;
    },

    /**
     * Mouse click button functions (for toolbar)
     */
    domouseclick: function(button) {
        this.resetFrames();
        
        // change tool --> execute quit function
        try {
        	if (typeof(PM.Map.mode) != 'undefined' && PM.Map.mode != button) {
	            var fct = PM.Map.mode + '_Quit';
	            if ($.isFunction(PM.Map[fct])) {
	                eval('PM.Map.' + fct + '()');
	            }
        	}
        } catch(e) {
        	if (window.console) console.log(e);
        }
                
        switch (button) {
            case 'home':
                this.zoomfullext();
                break;
            
            case 'zoomin':
                PM.Map.mode = 'map';
                PM.Map.zoom_type = 'zoomrect';
                PM.Map.maction = 'box';
                PM.Map.tool = 'zoomin';
                break;
            case 'zoomout':
                PM.Map.mode = 'map';
                PM.Map.zoom_type = 'zoompoint';
                PM.Map.zoom_factor = -2;
                PM.Map.maction = 'click';
                PM.Map.tool = 'zoomout';
                break;
            case 'identify':
                PM.Map.mode = 'query';
                PM.Map.maction = 'click';
                PM.Map.tool = 'identify';
                break;
            case 'pan':
                PM.Map.mode = 'map';
                PM.Map.zoom_type = 'zoompoint';
                PM.Map.zoom_factor = 1;
                PM.Map.maction = 'pan';
                PM.Map.tool = 'pan';
                break;
            case 'select':
                PM.Map.mode = 'nquery';
                PM.Map.maction = 'box';
                PM.Map.tool = 'select';
                var selurl = PM_XAJAX_LOCATION + 'x_select.php?'+SID;
                PM.Map.updateSelectTool(selurl);
                //_$('loadFrame').src = selurl;
                break;
            case 'auto_identify':
                PM.Map.mode = 'iquery';
                PM.Map.maction = 'move';
                PM.Map.tool = 'auto_identify';
                var selurl = PM_XAJAX_LOCATION + 'x_select.php?'+SID+'&autoidentify=1';
                PM.Map.updateSelectTool(selurl);
                break;
            case 'measure':
                PM.Map.maction = 'measure';
                PM.Map.mode = 'measure';
                PM.Map.tool = 'measure';
                PM.UI.createMeasureInput();
                break;
            case 'digitize':
                PM.Map.mode = 'digitize';
                PM.Map.maction = 'click';
                PM.Map.tool = 'digitize';
                break;
            case 'poi':   
                PM.Map.mode = 'poi';
                PM.Map.maction = 'click';
                PM.Map.tool = 'poi';
                break;
            default:
                // for anything else (new) apply function 'button_click()'
                try {
                    var fct = button + '_click';
                    if ($.isFunction(PM.Map[fct])) {
                        eval('PM.Map.' + fct + '()');
                    }
                    return false;
                } catch(e) {
                	if (window.console) console.log(e);
                }
        }
        
        // Set cursor appropriate to selected tool 
        if (PM.useCustomCursor) {
            PM.setCursor(false, false);
        }
    },

    /**
     * custom sample script for extending tool functions
     */
    poi_click: function() {
        PM.Map.mode = 'poi';
        PM.Map.maction = 'click';
        PM.Map.tool = 'poi'; 
        
        if (PM.useCustomCursor) {
            PM.setCursor(false, 'crosshair');
        }
    },

    /**
     * Called by various activated tools to disable certain displayed features for measure and select
     */
    resetFrames: function() {
        this.hideHelpMessage();
        $('#mapToolArea').hide().html('');
        if (PM.Map.mode == 'nquery' || PM.Map.mode == 'iquery' || PM.Map.maction == 'measure') {
            if (PM.Map.maction == 'measure') {
                PM.Draw.resetMeasure();
            }
            if (PM.Map.mode == 'iquery' || PM.Map.mode == 'nquery') hideObj(_$('iqueryContainer'));
            
        } else {
            $('#mapToolArea').hide().html('');
        }
        
        //this.zoom_factor = 1;
    },

    /**
     * Reload application
     */
    reloadMap: function(remove) {
        var mapurl = PM_XAJAX_LOCATION + 'x_load.php?'+SID+'&zoom_type=zoompoint';
        if (remove) {
            mapurl += '&resultlayer=remove';
            PM.extentSelectedFeatures = null;
        }
        this.updateMap(mapurl);
    },

    /**
     * Show help message over map
     */
    showHelpMessage: function(hm) {
        $('#helpMessage').html(hm).show();
    },

    /**
     * Hide help message over map
     */
    hideHelpMessage: function() {
        $('#helpMessage').html('').hide();
    },

    /**
     * Close info win and unregister session var 'resultlayer'
     */
    clearInfo: function() {
        PM.Map.zoomselected = '0';
            this.reloadMap(true);
    },

    /**
     * Set slider image depending on scale
     * Values defined in 'config.ini'
     */
    setSlider: function(curscale) {
        if (myslider) {
            var sliderPos = getSliderPosition(curscale);
            myslider.setPosition(sliderPos);
            if (_$('refsliderbox')) hideObj(_$('refsliderbox'));
        }
        return false;
    },
    
    /**
     * For loading/updating the MAP
     */
    updateMap: function(murl) {
        $("#loading").showv();
        //if (window.console) console.log(murl);
        $.ajax({
            url: murl,
            dataType: "json",
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if (window.console) console.log(errorThrown);
            },
            success: function(response){
                // Reload application when PHP session expired
                var sessionerror = response.sessionerror;
                if (sessionerror == 'true') {
                   errormsg = _p('Session expired - Reloading application'); 
                   window.location.reload();
                   return false;
                }
                
                var rBxL = response.refBoxStr.split(',');
                PM.minx_geo = parseFloat(response.minx_geo);
                PM.maxy_geo = parseFloat(response.maxy_geo);
                PM.xdelta_geo = parseFloat(response.xdelta_geo);
                PM.ydelta_geo = parseFloat(response.ydelta_geo);
                var geo_scale = response.geo_scale;
                var urlPntStr = response.urlPntStr;
                
                // Load new map image
                PM.Map.swapMapImg(response.mapURL);
                
                
                // Check if TOC and legend have to be updated
                var refreshLegend = eval(response.refreshLegend);
                var refreshToc = eval(response.refreshToc);
                if (PM.Map.forceRefreshToc) {
                    refreshToc = true;
                    PM.Map.forceRefreshToc = false;
                }
                if (refreshToc) {
                    var tocurl = PM_XAJAX_LOCATION + 'x_toc_update.php?' + SID;
                    PM.Toc.tocUpdateScale(tocurl);
                }
                
                if (refreshLegend) {
                    if ($('#' + PM.Toc.legendContainer).is(":visible") || PM.Toc.updateHiddenLegend) {
                        PM.Toc.updateLegend();
                    }
                }
                
                
                // Scale-related activities
                PM.Map.writescale(geo_scale);
                PM.Map.setSlider(geo_scale);
                PM.scale = geo_scale;

                // trigger event to lauch all functions bound to map update
                $("#pm_mapUpdateEvent").trigger("change");
               
                // Reference image: set DHTML objects
                PM.ZoomBox.setRefBox(rBxL[0], rBxL[1], rBxL[2], rBxL[3]);
                
                // Update SELECT tool OPTIONs in case of 'select' mode
                var vMode = PM.Map.mode;
                var autoidentify = '';
                if (vMode == 'nquery' || vMode == 'iquery') {
                    if (vMode == 'iquery'){
                        autoidentify = '&autoidentify=1';
                    }
                    var selurl = PM_XAJAX_LOCATION + 'x_select.php?'+ SID + '&activegroup=' + PM.Query.getSelectLayer() + autoidentify;
                    PM.Map.updateSelectTool(selurl);
                
                // If measure was active, delete all masure elements
                } else if (vMode == 'measure') {
                    PM.Draw.resetMeasure();

                // transmit 'afterUpdateMap' event
				} else {
					try {
                        var fct = vMode + '_afterUpdateMap';
                        if ($.isFunction(PM.Map[fct])) {
                            eval('PM.Map.' + fct + '()');
                        }
	                } catch(e) {
                    	if (window.console) console.log(e);
	                }
				}
            }
        });   
    },
    
    crossfadeMapImg: false,
    crossfadeMapImgSpeed: 500,
    _mapImgOpacity: false,
    _blendMapInt: false,
    
    swapMapImg: function(imgSrc) {
        if (this.crossfadeMapImg) {
            $('#fadeMapimgLayer').remove();
            var mapImgLayer = $('#mapimgLayer');
            var fadeMapImgLayer = mapImgLayer.clone().id('fadeMapimgLayer');
            fadeMapImgLayer.children('img').each(function (i) {
                $(this).id('fadeMapImg');
            });
            fadeMapImgLayer.appendTo($('#map'));
            
            mapImgLayer.css({opacity:0.0});
            $('#mapImg').src(imgSrc);
            this._mapImgOpacity = 0;
            this._blendMapInt = setInterval("PM.Map.blendMapImg()", 20);   
        } else {
            $('#mapImg').src(imgSrc);
        }
    },
    
    blendMapImg: function() {
        if (this._mapImgOpacity < 1) {
            var fop = 1 - this._mapImgOpacity;
            $('#fadeMapimgLayer').css({opacity: fop});
            $('#mapimgLayer').css({opacity: this._mapImgOpacity});
            this._mapImgOpacity += 50/this.crossfadeMapImgSpeed;
        } else {
            clearInterval(this._blendMapInt);
            $('#fadeMapimgLayer').remove();
        }
    },
    

    /** 
     * For SELECT tool 
     * called from 'updateMap()' and 'updateSelLayers()'
     */
    updateSelectTool: function(selurl) {
        $.ajax({
            url: selurl,
            dataType: "html",
            success: function(response){     
                var selStr = response;
                // change existing #selform element
				if ($('#selform').length) {
					$('#selform').replaceWith(selStr);
                // insert #selform element
				} else {
					$('#mapToolArea').append(selStr);
				}
                $('#mapToolArea').show();
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if (window.console) console.log(errorThrown);
            }
        });   
    },

    /**
     * Update layer options list for selection/iquery
     */
    updateSelLayers: function(selurl) {
        $.ajax({
            url: selurl,
            dataType: "json",
            success: function(response){
            
                // Update SELECT tool OPTIONs in case of 'select' mode
                var vMode = PM.Map.mode;
                if (vMode == 'nquery' || vMode == 'iquery') {
                    var selurl = PM_XAJAX_LOCATION + 'x_select.php?'+ SID + '&activegroup=' + PM.Query.getSelectLayer() ;
                    PM.Map.updateSelectTool(selurl);
				
				// transmit 'afterUpdateSelLayers' event
				} else if (vMode != 'measure') {
					try {
                        var fct = vMode + '_afterUpdateSelLayers';
                        if ($.isFunction(PM.Map[fct])) {
                            eval('PM.Map.' + fct + '()');
                        }
	                } catch(e) {
	                	if (window.console) console.log(e);
	                }
				}
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if (window.console) console.log(errorThrown);
            }
        });
    },

    /**
     * quit iquery event
     */
    iquery_Quit: function() {
    	PM.Query.hideIQL();
    },
    
    /**
     * Add point of interest to map
     */
    addPOI: function(digitizeurl) {
        $.ajax({
            type: "POST",
            url: digitizeurl,
            success: function(response){
                PM.Map.changeLayersDraw();
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if (window.console) console.log(errorThrown);
            }
        });
    }

});


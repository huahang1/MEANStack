'use strict';

var _ = require('lodash');
var Look = require('./look.model');
var path = require('path');
var express = require('express');
var utils = require('../../utils/utils.js');

exports.allLooks = function (req,res) {

    Look.find({})
        .sort({
            createTime: -1
        })
        .exec(function (err,looks) {

            if (err){
                return handleError(res, err);
            }
            if (!looks){
                return res.sendStatus(404);
            }

            console.log('looks: ', looks);

             return res.status(200).json(looks);
        })
};

exports.userLooks = function (req,res) {
    var userEmail = req.query.email;
    Look.find({
        email:{
            $in:userEmail
        }
    }).sort({
        createTime:-1
    })
        .exec(function (err,looks) {
            if (err){
                return handleError(res, err);
            }
            console.log('looks: ', looks);
            return res.status(200).json(looks);
        });
};

exports.scrapeUpload = function (req,res) {

    console.log('receive request from scrapeUpload');

    var random = utils.randomizer(32,'0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

    utils.downloadURI(req.body.image, '../client/assets/images/uploads/' + random + '.png', function (filename) {

        console.log('done');

        var newLook = new Look();

        newLook.title = req.body.title;
        newLook.email = req.body.email;
        newLook.linkURL = req.body.linkURL;
        newLook.description = req.body.description;
        newLook.userName = req.body.name;
        newLook._creator = req.body._creator;
        newLook.createTime = Date.now();
        newLook.upVotes = 0;
        newLook.image = filename.slice(9);

        newLook.save(function (err,item) {
            if (err){
                console.log('error happens');
            }else{
                console.log('successfully post saved');
                console.log(item);
                res.status(200).json(item);
            }
        });
    });
};

exports.popLooks=function (req,res) {
    Look.find(req.params.id)
        .sort('-upVotes')
        .limit(6)
        .exec(function (err,looks) {
            if (err){
                return handleError(res, err);
            }
            console.log('looks: ', looks);
            return res.json(looks);
        });
}

exports.upload=function (req,res) {
    var newLook = new Look();
    var fileimage = req.middlewareStorage.fileimage;

    newLook.image = '/assets/images/uploads/' + fileimage;
    newLook.email = req.body.email;
    newLook.linkURL = req.body.linkURL;
    newLook.title = req.body.title;
    newLook.description = req.body.description;
    newLook.userName = req.body.name;
    newLook._creator = req.body._creator;
    newLook.createTime = Date.now();
    newLook.upVotes = 0;
    newLook.save(function (err,item) {
        if (err){
            console.log('error happens');
        }else{
            console.log('successfully post saved');
            console.log(item);
            res.status(200).json(item);
        }
    });
};

exports.singleLook = function (req,res) {
    Look.findById(req.params.lookId,function (err,look) {
        if (err){
            return handleError(res, err);
        }
        if (!look){
            return res.sendStatus(404);
        }
        return res.json(look);
    });
};

exports.update = function (req,res) {
    if (req.body._id){
        delete req.body._id;
    }
    Look.findById(req.params.id, function (err,look) {
        if (err){
            return handleError(res, err);
        }
        if (!look){
            return res.sendStatus(404);
        }
        var updated = _.merge(look, req.body);
        updated.save(function (err) {
            if (err){
                return handleError(res, err);
            }
            console.log('look: ', look);
            return res.json(look);
        });
    });
};

exports.delete = function (req,res) {
    Look.findById(req.params.id,function (err,look) {
        if (err){
            return handleError(res, err);
        }
        if (!look){
            return res.sendStatus(404);
        }
        look.remove(function (err) {
            if (err){
                return res.sendStatus(404);
            }
            return res.sendStatus(200);
        });
    });
};

exports.addView = function (req,res) {
    Look.findById(req.params.id,function (err,look) {
        if (err){
            return handleError(res, err);
        }
        if (!look){
            return res.sendStatus(404);
        }
        look.views++;
        look.save(function (err) {
            if (err){
                return handleError(err);
            }
            return res.json(look);
        });
    });
};

exports.addUpvote = function (req,res) {
    Look.findById(req.params.id,function (err,look) {
        if (err){
            return handleError(res, err);
        }
        if (!look){
            return res.sendStatus(404);
        }
        look.upVotes++;
        look.save(function (err) {
            if (err){
                return handleError(res, err);
            }
            return res.json(look);
        });
    });
};

function handleError(res,err) {
    return res.send(500,err);
}
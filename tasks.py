from flask import Blueprint, request, jsonify
from database import mongo
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson.objectid import ObjectId
from datetime import datetime

task = Blueprint("task", __name__)


# Add Task API
@task.route("/add", methods=["POST"])
@jwt_required()
def add_task():

    user_email = get_jwt_identity()

    data = request.json

    mongo.db.tasks.insert_one({
    "user_email": user_email,
    "task_title": data.get("task_title"),
    "description": data.get("description"),
    "priority": data.get("priority"),
    "status": "Pending",
    "favorite":False,
    "due_date": data.get("due_date"),
    "created_at": datetime.now()
})
    return jsonify({
        "message": "Task Added Successfully"
    }), 201



# Get All Tasks API
@task.route("/all", methods=["GET"])
@jwt_required()
def get_tasks():

    user_email = get_jwt_identity()
    print("USER:", user_email)

    tasks = list(mongo.db.tasks.find({
        "user_email": user_email
    }))

    print("TASKS:", tasks)

    for t in tasks:
        t["_id"] = str(t["_id"])

    return jsonify(tasks), 200


# Update Task Status API
@task.route("/edit/<task_id>", methods=["PUT"])
@jwt_required()
def edit_task(task_id):

    user_email = get_jwt_identity()

    result = mongo.db.tasks.update_one(
        {
            "_id": ObjectId(task_id),
            "user_email": user_email
        },
        {
        "$set": {
    "task_title": request.json.get("task_title"),
    "description": request.json.get("description"),
    "priority": request.json.get("priority"),
    "due_date": request.json.get("due_date")
}
        }
    )

    if result.matched_count:
        return jsonify({
            "message": "Task Updated Successfully"
        }), 200

    return jsonify({
        "message": "Task not found"
    }), 404
@task.route("/favorite/<id>", methods=["PUT"])
@jwt_required()
def favorite_task(id):

    task = mongo.db.tasks.find_one({"_id": ObjectId(id)})

    if not task:
        return jsonify({"message": "Task not found"}), 404

    new_status = not task.get("favorite", False)

    mongo.db.tasks.update_one(
        {"_id": ObjectId(id)},
        {"$set": {"favorite": new_status}}
    )

    return jsonify({
        "message": "Favorite updated",
        "favorite": new_status
    })
@task.route("/update/<task_id>", methods=["PUT"])
@jwt_required()
def complete_task(task_id):

    user_email = get_jwt_identity()

    result = mongo.db.tasks.update_one(
        {
            "_id": ObjectId(task_id),
            "user_email": user_email
        },
        {
            "$set": {
                "status": "Completed"
            }
        }
    )

    if result.matched_count:
        return jsonify({
            "message": "Task Completed Successfully"
        }), 200

    return jsonify({
        "message": "Task not found"
    }), 404
# Delete Task API
@task.route("/delete/<task_id>", methods=["DELETE"])
@jwt_required()
def delete_task(task_id):

    user_email = get_jwt_identity()

    result = mongo.db.tasks.delete_one(
        {
            "_id": ObjectId(task_id),
            "user_email": user_email
        }
    )

    if result.deleted_count:
        return jsonify({
            "message": "Task Deleted Successfully"
        }), 200

    return jsonify({
        "message": "Task not found"
    }), 404
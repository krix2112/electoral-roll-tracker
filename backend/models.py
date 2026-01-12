"""
Database models for Electoral Roll Tracker
Owner: Vansh (Backend Developer)
"""

from database import db
from datetime import datetime
from sqlalchemy import Index

class ElectoralRoll(db.Model):
    """Model for storing electoral roll metadata"""
    __tablename__ = 'electoral_rolls'
    
    id = db.Column(db.Integer, primary_key=True)
    upload_id = db.Column(db.String(36), unique=True, nullable=False, index=True)
    filename = db.Column(db.String(255), nullable=False)
    row_count = db.Column(db.Integer, nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    data_hash = db.Column(db.String(64))
    
    voter_records = db.relationship('VoterRecord', backref='electoral_roll', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'upload_id': self.upload_id,
            'filename': self.filename,
            'row_count': self.row_count,
            'uploaded_at': self.uploaded_at.isoformat(),
            'data_hash': self.data_hash
        }
    
    def __repr__(self):
        return f'<ElectoralRoll {self.filename} ({self.row_count} records)>'


class VoterRecord(db.Model):
    """Model for storing individual voter records"""
    __tablename__ = 'voter_records'
    
    id = db.Column(db.Integer, primary_key=True)
    upload_id = db.Column(db.String(36), db.ForeignKey('electoral_rolls.upload_id'), nullable=False, index=True)
    voter_id = db.Column(db.String(50), nullable=False, index=True)
    name = db.Column(db.String(255), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    address = db.Column(db.Text, nullable=False)
    registration_date = db.Column(db.String(20), nullable=False)
    row_hash = db.Column(db.String(64), nullable=False, index=True)
    
    __table_args__ = (
        Index('idx_upload_voter', 'upload_id', 'voter_id'),
        Index('idx_upload_hash', 'upload_id', 'row_hash'),
    )
    
    def to_dict(self):
        return {
            'voter_id': self.voter_id,
            'name': self.name,
            'age': self.age,
            'address': self.address,
            'registration_date': self.registration_date
        }
    
    def __repr__(self):
        return f'<VoterRecord {self.voter_id}: {self.name}>'
